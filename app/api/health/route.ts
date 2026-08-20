import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export function GET(){return NextResponse.json({status:"ok",service:"genctek-portal",time:new Date().toISOString(),database:process.env.DATABASE_URL?"configured":"not-configured"},{headers:{"Cache-Control":"no-store"}})}
