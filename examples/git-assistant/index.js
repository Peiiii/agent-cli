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
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var util_1 = require("util");
var execAsync = (0, util_1.promisify)(child_process_1.exec);
var GitAssistantPlugin = /** @class */ (function () {
    function GitAssistantPlugin() {
        var _this = this;
        this.name = 'git-assistant';
        this.version = '1.0.0';
        this.description = 'Git 操作助手插件';
        this.commands = {
            commit: {
                description: '智能提交代码',
                execute: function (args, context) { return __awaiter(_this, void 0, void 0, function () {
                    var status_1, commitMessage, error_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 5, , 6]);
                                return [4 /*yield*/, execAsync('git status --porcelain')];
                            case 1:
                                status_1 = (_a.sent()).stdout;
                                if (!status_1) {
                                    context.logger.info('没有需要提交的更改');
                                    return [2 /*return*/];
                                }
                                return [4 /*yield*/, context.ai.generate({
                                        prompt: "\u57FA\u4E8E\u4EE5\u4E0B git \u66F4\u6539\u751F\u6210\u7B80\u6D01\u7684\u63D0\u4EA4\u4FE1\u606F\uFF1A\n".concat(status_1),
                                        maxTokens: 50
                                    })];
                            case 2:
                                commitMessage = _a.sent();
                                // 执行提交
                                return [4 /*yield*/, execAsync('git add .')];
                            case 3:
                                // 执行提交
                                _a.sent();
                                return [4 /*yield*/, execAsync("git commit -m \"".concat(commitMessage.trim(), "\""))];
                            case 4:
                                _a.sent();
                                context.logger.info("\u6210\u529F\u63D0\u4EA4: ".concat(commitMessage));
                                return [3 /*break*/, 6];
                            case 5:
                                error_1 = _a.sent();
                                if (error_1 instanceof Error) {
                                    context.logger.error("Git \u64CD\u4F5C\u5931\u8D25: ".concat(error_1.message));
                                }
                                return [3 /*break*/, 6];
                            case 6: return [2 /*return*/];
                        }
                    });
                }); }
            },
            status: {
                description: '查看仓库状态',
                execute: function (args, context) { return __awaiter(_this, void 0, void 0, function () {
                    var stdout, error_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, execAsync('git status')];
                            case 1:
                                stdout = (_a.sent()).stdout;
                                context.logger.info(stdout);
                                return [3 /*break*/, 3];
                            case 2:
                                error_2 = _a.sent();
                                if (error_2 instanceof Error) {
                                    context.logger.error("\u83B7\u53D6\u72B6\u6001\u5931\u8D25: ".concat(error_2.message));
                                }
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); }
            }
        };
    }
    GitAssistantPlugin.prototype.onLoad = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('Git 助手插件已加载');
                return [2 /*return*/];
            });
        });
    };
    return GitAssistantPlugin;
}());
exports.default = GitAssistantPlugin;