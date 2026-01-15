"use client"
import ISF from "@img/ISF.jpg"
import ICYS from "@img/ICYS.jpg"
import Image from "next/image";
import { competition } from "../type";
import { useSearchParams } from "next/navigation";

export const dynamic = 'force-dynamic'

export default function BackGround() {
    const searchParams = useSearchParams()
    const event = searchParams.get("conference") as competition;
    return <div style={{ position: "fixed", inset:0, zIndex: -1 }}>
        <Image src={event == "KVIS-ISF" ? ISF : ICYS} alt="ISF" fill style={{objectFit:'cover'}}/>
    </div>
}