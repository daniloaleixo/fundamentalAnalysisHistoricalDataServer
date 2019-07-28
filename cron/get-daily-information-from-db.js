"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var firebase = __importStar(require("firebase-admin"));
var mongodb_1 = require("mongodb");
require('dotenv').config();
var comparadores = {
    patrLiq: { value: 2000000000, checked: 1 },
    liqCorr: { value: 1.5, checked: 1 },
    roe: { value: 20, checked: 1 },
    divPat: { value: 50, checked: 1 },
    cresc: { value: 5, checked: 1 },
    pvp: { value: 1.5, checked: 1 },
    pl: { value: 15, checked: 1 },
    dy: { value: 2.5, checked: 1 },
    plxpvp: { value: 22.5, checked: 1 },
};
exports.saveStockHistory = function () {
    // export const saveStockHistory = functions.database.ref('/stocks')
    //   .onWrite((change: Change<DataSnapshot>, context) => {
    return saveAllStocks()
        .then(function (res) {
        console.log(res);
        // console.log('Payload:', change, "Context", context);
    })
        .catch(function (err) {
        console.log(err);
    });
};
function saveAllStocks() {
    return __awaiter(this, void 0, void 0, function () {
        var allStocks, databaseName, mongoClient, dbConn, inserted, index, stock, collection, results, e_1, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Init firebase
                    firebase.initializeApp({
                        credential: firebase.credential.cert({
                            "type": "service_account",
                            "project_id": process.env.project_id,
                            "private_key_id": process.env.private_key_id,
                            "client_email": process.env.client_email,
                            "client_id": process.env.client_id,
                            "auth_uri": process.env.auth_uri,
                            "token_uri": process.env.token_uri,
                            "auth_provider_x509_cert_url": process.env.auth_provider_x509_cert_url,
                            "client_x509_cert_url": process.env.client_x509_cert_url,
                            "private_key": process.env.private_key,
                        }),
                        databaseURL: process.env.FIREBASE_URL
                    });
                    return [4 /*yield*/, getFirebasePayload(firebase.database())];
                case 1:
                    allStocks = _a.sent();
                    console.log("Now I have all the stocks from firebase", Object.keys(allStocks).length);
                    allStocks = calculateScores(allStocks);
                    // console.log(allStocks);
                    console.log("Agora tenho todos os stocks, tamanho: ", allStocks.length);
                    databaseName = "stocks";
                    return [4 /*yield*/, getConnection()];
                case 2:
                    mongoClient = _a.sent();
                    dbConn = mongoClient.db(databaseName);
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 12, , 13]);
                    inserted = 0;
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 9, , 10]);
                    index = 0;
                    _a.label = 5;
                case 5:
                    if (!(index < allStocks.length)) return [3 /*break*/, 8];
                    stock = allStocks[index];
                    collection = dbConn.collection(stock.stockCode);
                    return [4 /*yield*/, collection.insertOne(stock)];
                case 6:
                    results = _a.sent();
                    console.log("Saved stock " + (index + 1) + " of " + allStocks.length);
                    inserted = results.insertedCount ? inserted + 1 : inserted;
                    _a.label = 7;
                case 7:
                    index++;
                    return [3 /*break*/, 5];
                case 8: return [3 /*break*/, 10];
                case 9:
                    e_1 = _a.sent();
                    console.log(e_1);
                    return [3 /*break*/, 10];
                case 10:
                    console.log("Inserted a total of ", inserted, " stoks");
                    return [4 /*yield*/, closeConnection(mongoClient)];
                case 11:
                    _a.sent();
                    process.exit(0);
                    return [3 /*break*/, 13];
                case 12:
                    e_2 = _a.sent();
                    console.log("ERRO", e_2);
                    process.exit(-1);
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/];
            }
        });
    });
}
function getFirebasePayload(database) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) {
                    database.ref().child('stocks').once('value').then(function (snapshot) {
                        console.log("Consegui as infos do firebase ", snapshot.val() != undefined);
                        var arrayStocksHistory = [];
                        // console.log(snapshot.val())
                        Object.keys(snapshot.val()).forEach(function (key) {
                            // console.log(snapshot.val()[key])
                            var object = JSON.parse(snapshot.val()[key]);
                            arrayStocksHistory.push(object);
                            // console.log(object);
                        });
                        // Sort by date, the first one will be the newest
                        arrayStocksHistory.sort(function (a, b) {
                            var date1 = new Date(a.date);
                            var date2 = new Date(b.date);
                            return date2 > date1 ? 1 : -1;
                        });
                        // console.log(arrayStocksHistory);
                        var arrayObjects = [];
                        Object.keys(arrayStocksHistory[0]).forEach(function (key) {
                            arrayObjects.push(arrayStocksHistory[0][key]);
                        });
                        resolve(arrayStocksHistory[0]);
                    });
                })];
        });
    });
}
function getConnection() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var url, client, error_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                url = 'mongodb+srv://' + process.env.USER + ':' + process.env.PASSWORD + '@' + process.env.HOST;
                                client = new mongodb_1.MongoClient(url, { useNewUrlParser: true });
                                return [4 /*yield*/, client.connect()];
                            case 1:
                                _a.sent();
                                resolve(client);
                                return [3 /*break*/, 3];
                            case 2:
                                error_1 = _a.sent();
                                console.error(error_1);
                                reject(error_1);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
function closeConnection(mongoClient) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    mongoClient.close(function (err) {
                        if (err)
                            reject(err);
                        else
                            resolve();
                    });
                })];
        });
    });
}
var calculateScores = function (stockHash) {
    console.log('calculando socres');
    var dividePor = 0;
    Object.keys(comparadores).forEach(function (elem) {
        if (comparadores[elem].checked)
            dividePor += 1;
    });
    console.log('dividePor', dividePor);
    var stocks = [];
    var stockArray = Object.keys(stockHash).map(function (key) { return stockHash[key]; });
    for (var i = 0; i < stockArray.length; i++) {
        if (typeof (stockArray[i]) == "object") {
            Object.keys(stockArray[i]).forEach(function (stock) {
                var nota = 0.0;
                var patrLiq = parseFloat(stockArray[i][stock]["Pat.Liq"].replace(/\./g, '').replace(/\,/g, '.'));
                if (comparadores.patrLiq.checked && patrLiq > comparadores.patrLiq.value)
                    nota = nota + 1;
                var liqCorr = parseFloat(stockArray[i][stock]["Liq.Corr."].replace(/\./g, '').replace(/,/g, '.'));
                if (comparadores.liqCorr.checked && liqCorr > comparadores.liqCorr.value)
                    nota = nota + 1;
                var roe = parseFloat(stockArray[i][stock]["ROE"].replace(/\./g, '').replace(/\,/g, '.').replace(/%/g, ''));
                if (comparadores.roe.checked && roe > comparadores.roe.value)
                    nota = nota + 1;
                var divPat = parseFloat(stockArray[i][stock]["Div.Brut/Pat."].replace(/\./g, '').replace(/\,/g, '.').replace(/%/g, ''));
                if (comparadores.divPat.checked && divPat * 100 < comparadores.divPat.value && divPat > 0)
                    nota = nota + 1;
                var cresc = parseFloat(stockArray[i][stock]["Cresc.5a"].replace(/\./g, '').replace(/\,/g, '.').replace(/%/g, ''));
                if (comparadores.cresc.checked && cresc > comparadores.cresc.value)
                    nota = nota + 1;
                var pvp = parseFloat(stockArray[i][stock]["P/VP"].replace(/\./g, '').replace(/\,/g, '.').replace(/%/g, ''));
                if (comparadores.pvp.checked && pvp < comparadores.pvp.value && pvp > 0)
                    nota = nota + 1;
                var pl = parseFloat(stockArray[i][stock]["P/L"].replace(/\./g, '').replace(/\,/g, '.').replace(/%/g, ''));
                if (comparadores.pl.checked && pl < comparadores.pl.value && pl > 0)
                    nota = nota + 1;
                var dy = parseFloat(stockArray[i][stock]["DY"].replace(/\./g, '').replace(/\,/g, '.').replace(/%/g, ''));
                if (comparadores.dy.checked && dy > comparadores.dy.value)
                    nota = nota + 1;
                if (comparadores.plxpvp.checked && pl * pvp < comparadores.plxpvp.value)
                    nota = nota + 1;
                var newStock = {
                    patrimonioLiquido: patrLiq,
                    liquidezCorrente: liqCorr,
                    ROE: roe,
                    divSobrePatrimonio: divPat,
                    crescimentoCincoAnos: cresc,
                    precoSobreVP: pvp,
                    precoSobreLucro: pl,
                    dividendos: dy,
                    stockCode: stock.toString(),
                    score: (nota / dividePor * 10.0),
                    stockPrice: turnIntoFloat(stockArray[i][stock].cotacao),
                    PSR: turnIntoFloat(stockArray[i][stock].PSR),
                    precoSobreAtivo: turnIntoFloat(stockArray[i][stock]['P/Ativo']),
                    precoSobreCapitalGiro: turnIntoFloat(stockArray[i][stock]['P/Cap.Giro']),
                    precoSobreEBIT: turnIntoFloat(stockArray[i][stock]['P/EBIT']),
                    precoSobreAtivoCirculante: turnIntoFloat(stockArray[i][stock]['P/Ativ.Circ.Liq.']),
                    EVSobreEBIT: turnIntoFloat(stockArray[i][stock]['EV/EBIT']),
                    margemEBIT: turnIntoFloat(stockArray[i][stock].EBITDA),
                    margemLiquida: turnIntoFloat(stockArray[i][stock]['Mrg.Liq.']),
                    ROIC: turnIntoFloat(stockArray[i][stock].ROIC),
                    liquidezDoisMeses: turnIntoFloat(stockArray[i][stock]['Liq.2m.']),
                    timestamp: new Date()
                };
                stocks.push(newStock);
                stockArray[i][stock]["nota"] = (nota / dividePor * 10.0).toFixed(2);
                stockArray[i][stock]["stock"] = stock;
                // console.log([stock, stockArray[i][stock]["nota"], patrLiq, liqCorr, roe, divPat, cresc, pvp, pl, dy])
            });
        }
    }
    console.log("Todas as notas calculadas");
    return stocks;
};
function turnIntoFloat(num) {
    return parseFloat(num.replace(/\./g, '').replace(/\,/g, '.').replace(/%/g, ''));
}
exports.saveStockHistory();
