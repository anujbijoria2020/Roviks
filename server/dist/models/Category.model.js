"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const catalogCategories_1 = require("../constants/catalogCategories");
const categorySchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    kind: { type: String, enum: ['products', 'mockups', 'designs'], default: 'products' },
    sortOrder: { type: Number, default: 0 }
}, { timestamps: true });
categorySchema.pre('save', function () {
    const canonicalCategory = catalogCategories_1.CATALOG_CATEGORY_DEFINITIONS.find((definition) => definition.slug === this.slug || definition.name === this.name);
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    if (canonicalCategory) {
        this.name = canonicalCategory.name;
        this.slug = canonicalCategory.slug;
        this.kind = canonicalCategory.kind;
        this.sortOrder = canonicalCategory.sortOrder;
    }
});
exports.default = mongoose_1.default.model('Category', categorySchema);
