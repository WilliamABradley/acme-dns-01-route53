"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
var client_route_53_1 = require("@aws-sdk/client-route-53");
var getZones = function (client) { return __awaiter(void 0, void 0, void 0, function () {
    var data, zoneData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client.send(new client_route_53_1.ListHostedZonesByNameCommand({}))];
            case 1:
                data = _a.sent();
                zoneData = data.HostedZones.map(function (zone) {
                    var _a;
                    // drop '.' at the end of each zone
                    zone.Name = (_a = zone.Name) === null || _a === void 0 ? void 0 : _a.substring(0, zone.Name.length - 1);
                    return zone;
                });
                if (data.IsTruncated) {
                    throw "Too many records to deal with. Some are truncated. ";
                }
                return [2 /*return*/, zoneData];
        }
    });
}); };
var getChange = function (client, changeId) { return __awaiter(void 0, void 0, void 0, function () {
    var change, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, client.send(new client_route_53_1.GetChangeCommand({ Id: changeId }))];
            case 1:
                change = _a.sent();
                return [2 /*return*/, change];
            case 2:
                e_1 = _a.sent();
                console.log("Error polling for change: ".concat(changeId, ":"), e_1);
                throw e_1;
            case 3: return [2 /*return*/];
        }
    });
}); };
var sleep = function (ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
};
var create = function (config) {
    var _this = this;
    var _a, _b;
    if (config === void 0) { config = {}; }
    (_a = config.debug) !== null && _a !== void 0 ? _a : (config.debug = false);
    (_b = config.ensureSync) !== null && _b !== void 0 ? _b : (config.ensureSync = false);
    var client = new client_route_53_1.Route53Client(config);
    return {
        init: function () {
            return null;
        },
        zones: function () { return __awaiter(_this, void 0, void 0, function () {
            var zones, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, getZones(client)];
                    case 1:
                        zones = _a.sent();
                        return [2 /*return*/, zones.map(function (zone) { return zone.Name; })];
                    case 2:
                        e_2 = _a.sent();
                        console.error("Error listing zones:", e_2);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        }); },
        set: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var ch, txt, recordName, zoneData, zone, recordSetResults, existingRecord, newRecord, resourceRecords, setResults, status_1, timeout, change, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ch = data.challenge;
                        txt = ch.dnsAuthorization;
                        recordName = "".concat(ch.dnsPrefix, ".").concat(ch.dnsZone);
                        if (config.debug) {
                            console.log("Setting ".concat(ch, " to ").concat(txt));
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 9, , 10]);
                        return [4 /*yield*/, getZones(client)];
                    case 2:
                        zoneData = _a.sent();
                        zone = zoneData.filter(function (zone) { return zone.Name === ch.dnsZone; })[0];
                        if (!zone) {
                            console.error("Zone could not be found");
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, client.send(new client_route_53_1.ListResourceRecordSetsCommand({ HostedZoneId: zone.Id }))];
                    case 3:
                        recordSetResults = _a.sent();
                        if (config.debug) {
                            console.log("No existing records for ".concat(recordName, " in \n\t in:"), recordSetResults.ResourceRecordSets.map(function (rrs) {
                                return {
                                    name: rrs.Name,
                                    value: rrs.ResourceRecords.map(function (rrs) { return rrs.Value; }).join(","),
                                };
                            }));
                        }
                        existingRecord = recordSetResults
                            .ResourceRecordSets.map(function (rrs) {
                            var _a;
                            rrs.Name = (_a = rrs.Name) === null || _a === void 0 ? void 0 : _a.slice(0, -1);
                            return rrs;
                        }) // Remove last dot (.) from resource record set names
                            .filter(function (rrs) { return rrs.Name === recordName; });
                        newRecord = { Value: "\"".concat(txt, "\"") };
                        resourceRecords = [];
                        if (existingRecord.length) {
                            // record exists which means we need to append the new record and not set it from scratch (otherwise it replaces existing records)
                            if (config.debug) {
                                console.log("Record exists for:", recordName, ": ", existingRecord);
                            }
                            resourceRecords = __spreadArray(__spreadArray([], existingRecord[0].ResourceRecords, true), [newRecord], false);
                            if (config.debug) {
                                console.log("\t setting it to:", resourceRecords.map(function (rrs) { return rrs.Value; }).join(","));
                            }
                        }
                        else {
                            if (config.debug) {
                                console.log("Record does not exist ".concat(recordName));
                            }
                            resourceRecords = [newRecord];
                        }
                        return [4 /*yield*/, client.send(new client_route_53_1.ChangeResourceRecordSetsCommand({
                                HostedZoneId: zone.Id,
                                ChangeBatch: {
                                    Changes: [
                                        {
                                            Action: "UPSERT",
                                            ResourceRecordSet: {
                                                Name: recordName,
                                                Type: "TXT",
                                                TTL: 300,
                                                ResourceRecords: resourceRecords,
                                            },
                                        },
                                    ],
                                },
                            }))];
                    case 4:
                        setResults = _a.sent();
                        if (config.debug) {
                            console.log("Successfully set ".concat(recordName, " to \"").concat(txt, "\""));
                        }
                        if (!config.ensureSync) return [3 /*break*/, 8];
                        status_1 = setResults.ChangeInfo.Status;
                        _a.label = 5;
                    case 5:
                        if (!(status_1 === "PENDING")) return [3 /*break*/, 8];
                        timeout = 5000;
                        if (config.debug) {
                            console.log("\t but ... change is still pending. Will check again in ".concat(timeout / 1000, " seconds."));
                        }
                        return [4 /*yield*/, sleep(timeout)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, getChange(client, setResults.ChangeInfo.Id)];
                    case 7:
                        change = _a.sent();
                        status_1 = change.ChangeInfo.Status;
                        return [3 /*break*/, 5];
                    case 8: return [2 /*return*/, true];
                    case 9:
                        e_3 = _a.sent();
                        console.log("Error upserting txt record:", e_3);
                        return [2 /*return*/, null];
                    case 10: return [2 /*return*/];
                }
            });
        }); },
        remove: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var ch, txt, recordName, zoneData, zone, data_1, match, rr, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ch = data.challenge;
                        txt = ch.dnsAuthorization;
                        recordName = "".concat(ch.dnsPrefix, ".").concat(ch.dnsZone);
                        if (config.debug) {
                            console.log("Removing ".concat(recordName, " value ").concat(txt));
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, , 9]);
                        return [4 /*yield*/, getZones(client)];
                    case 2:
                        zoneData = _a.sent();
                        zone = zoneData.filter(function (zone) { return zone.Name === ch.dnsZone; })[0];
                        if (!zone) {
                            console.error("Zone could not be found");
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, client.send(new client_route_53_1.ListResourceRecordSetsCommand({ HostedZoneId: zone.Id }))];
                    case 3:
                        data_1 = _a.sent();
                        if (config.debug) {
                            console.log("\n\t from one of these existing records:", data_1.ResourceRecordSets.map(function (rrs) {
                                return {
                                    name: rrs.Name,
                                    value: rrs.ResourceRecords.map(function (rrs) { return rrs.Value; }).join(","),
                                };
                            }));
                        }
                        match = data_1.ResourceRecordSets.filter(function (rrs) {
                            return rrs.ResourceRecords.filter(function (txtRs) { return txtRs.Value.slice(1, -1) === txt; }).length;
                        } // remove quotes around record and match it against value we want to remove
                        )[0];
                        if (!(match && match.ResourceRecords.length > 1)) return [3 /*break*/, 5];
                        if (config.debug) {
                            console.log("Upserting to delete a value from:", recordName);
                        }
                        rr = match.ResourceRecords.filter(function (rr) { return rr.Value.slice(1, -1) !== txt; } // remove quotes
                        );
                        if (config.debug) {
                            console.log("\t new records will look like this:", rr.map(function (r) { return r.Value; }));
                        }
                        return [4 /*yield*/, client.send(new client_route_53_1.ChangeResourceRecordSetsCommand({
                                HostedZoneId: zone.Id,
                                ChangeBatch: {
                                    Changes: [
                                        {
                                            Action: "UPSERT",
                                            ResourceRecordSet: {
                                                Name: recordName,
                                                Type: "TXT",
                                                TTL: 300,
                                                ResourceRecords: rr,
                                            },
                                        },
                                    ],
                                },
                            }))];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 5:
                        // only one record value exists, so delete it
                        if (config.debug) {
                            console.log("Deleting whole record:", recordName);
                            console.log("\t value:", match.ResourceRecords.map(function (rr) { return rr.Value; }));
                        }
                        return [4 /*yield*/, client.send(new client_route_53_1.ChangeResourceRecordSetsCommand({
                                HostedZoneId: zone.Id,
                                ChangeBatch: {
                                    Changes: [
                                        {
                                            Action: "DELETE",
                                            ResourceRecordSet: {
                                                Name: recordName,
                                                Type: "TXT",
                                                TTL: 300,
                                                ResourceRecords: match.ResourceRecords,
                                            },
                                        },
                                    ],
                                },
                            }))];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [2 /*return*/, true];
                    case 8:
                        e_4 = _a.sent();
                        console.log("Encountered an error deleting the record:", e_4);
                        return [2 /*return*/, null];
                    case 9: return [2 /*return*/];
                }
            });
        }); },
        get: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var ch, txt, zoneData, zone, data_2, txtRecords, match, e_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ch = data.challenge;
                        txt = ch.dnsAuthorization;
                        if (config.debug) {
                            console.log("Getting record with ".concat(txt, " value"));
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, getZones(client)];
                    case 2:
                        zoneData = _a.sent();
                        zone = zoneData.filter(function (zone) { return zone.Name === ch.dnsZone; })[0];
                        if (!zone) {
                            console.error("Zone could not be found");
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, client.send(new client_route_53_1.ListResourceRecordSetsCommand({
                                HostedZoneId: zone.Id,
                            }))];
                    case 3:
                        data_2 = _a.sent();
                        if (data_2.IsTruncated) {
                            throw "Too many records to deal with. Some are truncated";
                        }
                        txtRecords = data_2.ResourceRecordSets.filter(function (rrs) { return rrs.Type === "TXT"; });
                        if (config.debug) {
                            console.log("\t existing txt values:", txtRecords);
                        }
                        match = txtRecords
                            .map(function (rrs) { return rrs.ResourceRecords.map(function (rec) { var _a; return (_a = rec.Value) === null || _a === void 0 ? void 0 : _a.slice(1, -1); }); } // remove quotes sorrounding the strings
                        )
                            .filter(function (txtRecords) {
                            var val = txtRecords.filter(function (rec) { return rec === txt; }); // match possible multiple values
                            return val.length;
                        })
                            .map(function (txtRec) {
                            var match = txtRec.filter(function (rec) { return rec === txt; })[0]; // only one match should exist, get it
                            return { dnsAuthorization: match };
                        })[0];
                        if (!match || match.dnsAuthorization === undefined) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, match];
                    case 4:
                        e_5 = _a.sent();
                        console.log("Encountered an error getting TXT records:", e_5);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        }); },
    };
};
exports.create = create;
//# sourceMappingURL=route53.js.map