"use client"

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DownloadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (color: string | "transparent") => void;
    initialColor?: string;
}

export default function DownloadDialog({ open, onOpenChange, onConfirm, initialColor = "#ffffff" }: DownloadDialogProps) {
    const [color, setColor] = useState<string>(initialColor);
    useEffect(() => {
        setColor(initialColor);
    }, [initialColor]);
    const [transparent, setTransparent] = useState<boolean>(false);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle>Choose background</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                    <div className="grid grid-cols-3 items-center gap-2">
                        <Label htmlFor="bgcolor" className="col-span-1 text-sm">Color</Label>
                        <div className="col-span-2 flex items-center gap-2">
                            <Input id="bgcolor" type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-16 p-1" />
                            <Input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="h-9" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input id="transparent" type="checkbox" checked={transparent} onChange={(e) => setTransparent(e.target.checked)} />
                        <Label htmlFor="transparent" className="text-sm">Transparent background</Label>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant={"ghost"} onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={() => { onConfirm(transparent ? "transparent" : color); onOpenChange(false); }}>Download</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


