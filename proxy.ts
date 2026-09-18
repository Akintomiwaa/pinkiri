import {NextResponse} from 'next/server';
// Authentication is paused; local workspace access remains open.
export function proxy(){return NextResponse.next();}
