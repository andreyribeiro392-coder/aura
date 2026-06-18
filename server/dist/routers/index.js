"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
const server_1 = require("@trpc/server");
const superjson_1 = __importDefault(require("superjson"));
const zod_1 = require("zod");
const t = server_1.initTRPC.create({
    transformer: superjson_1.default,
});
exports.appRouter = t.router({
    auth: t.router({
        me: t.procedure.query(() => {
            return null; // Placeholder
        }),
        logout: t.procedure.mutation(() => {
            return { success: true };
        }),
    }),
    // Adicionando outros placeholders baseados no que o frontend pode precisar
    products: t.router({
        list: t.procedure.query(() => []),
        get: t.procedure.input(zod_1.z.string()).query(() => null),
        byId: t.procedure.input(zod_1.z.any()).query(() => ({ id: 1, name: "", description: "", price: 0, imageUrl: "" })),
        search: t.procedure.input(zod_1.z.any()).query(() => []),
    }),
    categories: t.router({
        list: t.procedure.query(() => []),
        bySlug: t.procedure.input(zod_1.z.string()).query(() => ({ id: "1", name: "Category" })),
    }),
    cart: t.router({
        get: t.procedure.query(() => ({ items: [] })),
        list: t.procedure.query(() => []),
        add: t.procedure.input(zod_1.z.any()).mutation(() => ({ success: true })),
        remove: t.procedure.input(zod_1.z.any()).mutation(() => ({ success: true })),
        updateQuantity: t.procedure.input(zod_1.z.any()).mutation(() => ({ success: true })),
    }),
    favorites: t.router({
        list: t.procedure.query(() => []),
        add: t.procedure.input(zod_1.z.any()).mutation(() => ({ success: true })),
        remove: t.procedure.input(zod_1.z.any()).mutation(() => ({ success: true })),
    })
});
