"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCanonicalCategoryDefinition = exports.CATALOG_CATEGORY_DEFINITIONS = void 0;
exports.CATALOG_CATEGORY_DEFINITIONS = [
    { name: 'Products', slug: 'products', kind: 'products', sortOrder: 1 },
    { name: 'Mockups', slug: 'mockups', kind: 'mockups', sortOrder: 2 },
    { name: 'Designs', slug: 'designs', kind: 'designs', sortOrder: 3 },
];
const normalizeLabel = (value) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
const getCanonicalCategoryDefinition = (value) => exports.CATALOG_CATEGORY_DEFINITIONS.find((definition) => definition.slug === normalizeLabel(value) || definition.name.toLowerCase() === value.trim().toLowerCase());
exports.getCanonicalCategoryDefinition = getCanonicalCategoryDefinition;
