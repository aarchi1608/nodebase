import prisma from "@/lib/db";
import {z} from "zod";
import { createTRPCRouter, protectedProcedure , premiumProcedure} from "@/trpc/init";
import { PAGINATION } from "@/config/constants";
import type{Node , Edge} from "@xyflow/react";
import { CredentialType, NodeType } from "@/generated/prisma/client";
import { encrypt } from "@/lib/encryption";
export const credentialsRouter = createTRPCRouter({
    create : premiumProcedure.input(
        z.object({
            name : z.string().min(1 , "Name is required"),
            type : z.enum(CredentialType),
            value : z.string().min(1 , "Value is required"),
        })
    )
    .mutation(({ctx , input}) => {
        const [name , type , value] = [input.name, input.type, input.value];
        return prisma.credential.create({
            data : {
                name ,
                userId : ctx.auth.user.id,
                type,
                value : encrypt(value),//todo encrypt value before saving to db (amazon secrets manager)
            },
        });
    }),

    remove : protectedProcedure
    .input(z.object({id : z.string()}))
    .mutation(async ({ctx, input}) => {
        // First verify the credential belongs to the user
        const credential = await prisma.credential.findUnique({
            where : {
                id : input.id,
                userId : ctx.auth.user.id,
            },
        });
        if (!credential) {
            throw new Error("Credential not found or you don't have permission to delete it");
        }
        return prisma.credential.delete({
            where : {
                userId : ctx.auth.user.id,
                id : input.id,
            },
        });
    }),

    update : protectedProcedure
    .input(
        z.object({
            id : z.string(), 
            name : z.string().min(1 , "Name is required"),
            type : z.enum(CredentialType),
            value : z.string().min(1 , "Value is required"),
        }))
    .mutation(async({ctx , input}) => {
        const {id , type , value} = input;
        const credential = await prisma.credential.findUniqueOrThrow({
            where : {
                id , userId : ctx.auth.user.id,

            }
        });
        return prisma.credential.update({
            where : {
                id, 
                userId : ctx.auth.user.id,
            },
            data : {
                name : input.name,
                type,
                value : encrypt(value),
            }
        });

    }),

    getOne : protectedProcedure
    .input(z.object({id : z.string()}))
    .query(async ({ctx , input}) => {
        return prisma.credential.findUniqueOrThrow({
            where : {
                id : input.id,
                userId : ctx.auth.user.id,
            },
        });
    }),

    getMany : protectedProcedure
    .input (z.object({
        page : z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize : z.number().min(PAGINATION.MIN_PAGE_SIZE)
        .max(PAGINATION.MAX_PAGE_SIZE)
        .default(PAGINATION.DEFAULT_PAGE_SIZE),
    search : z.string().default(""),
    }))
    .query(async({ctx , input}) => {
        const [page , pageSize , search] = [input.page, input.pageSize, input.search];
        const [items , totalCount] = await Promise.all([
            prisma.credential.findMany({
                skip : (page - 1) * pageSize,
                take : pageSize,
            where : {
                userId : ctx.auth.user.id,
                name : {
                    contains : search,
                    mode : "insensitive",
                }
            },
            orderBy : {
                updatedAt : "desc",
            },

        }),
        prisma.credential.count({
            where : {
                userId : ctx.auth.user.id,
                name : {
                    contains : search,
                    mode : "insensitive",
                }
            }
        })
        ]);
        const totalPages = Math.ceil(totalCount / pageSize) ;
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        return {
            items,
            page,
            pageSize,
            totalCount,
            totalPages,
            hasNextPage,
            hasPreviousPage,
    }
    }),

    getByType : protectedProcedure
    .input(z.object({
        type : z.enum(CredentialType),
    }))
    .query( ({ctx , input}) => {
        const {type} = input;
        return prisma.credential.findMany({
            where : {
                userId : ctx.auth.user.id,
                type,
            },
            orderBy : {
                updatedAt : "desc",
            },
        })
    }),
    
});