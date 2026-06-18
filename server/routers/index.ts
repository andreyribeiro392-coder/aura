import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { z } from 'zod';

const t = initTRPC.create({
  transformer: superjson,
});

export const appRouter = t.router({
  auth: t.router({
    me: t.procedure.query(() => {
      return null as any; // Placeholder
    }),
    logout: t.procedure.mutation(() => {
      return { success: true };
    }),
  }),
  // Adicionando outros placeholders baseados no que o frontend pode precisar
  products: t.router({
    list: t.procedure.query(() => []),
    get: t.procedure.input(z.string()).query(() => null),
    byId: t.procedure.input(z.any()).query(() => ({ id: 1, name: "", description: "", price: 0, imageUrl: "" } as any)),
    search: t.procedure.input(z.any()).query(() => []),
  }),
  categories: t.router({
    list: t.procedure.query(() => []),
    bySlug: t.procedure.input(z.string()).query(() => ({ id: "1", name: "Category" })),
  }),
  cart: t.router({
    get: t.procedure.query(() => ({ items: [] })),
    list: t.procedure.query(() => []),
    add: t.procedure.input(z.any()).mutation(() => ({ success: true })),
    remove: t.procedure.input(z.any()).mutation(() => ({ success: true })),
    updateQuantity: t.procedure.input(z.any()).mutation(() => ({ success: true })),
  }),
  favorites: t.router({
    list: t.procedure.query(() => []),
    add: t.procedure.input(z.any()).mutation(() => ({ success: true })),
    remove: t.procedure.input(z.any()).mutation(() => ({ success: true })),
  })
});

export type AppRouter = typeof appRouter;
