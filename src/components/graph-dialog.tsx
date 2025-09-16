"use client"

import { Button } from "@/components/ui/button"
import { ContributionGraph } from "@/components/contribution-graph"
import type { AllYearsData } from "@/types/contributions"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface GithubUser {
    id: string
    avatar_url: string
    name: string | null
}

interface GraphDialogProps {
    triggerClassName?: string
    triggerContent?: React.ReactNode
    data: AllYearsData
    selectedYear: string
    onYearChange: (year: string) => void
    user: GithubUser | null
    showTotal?: boolean
}

export default function GraphDialog({
    triggerClassName,
    triggerContent,
    data,
    selectedYear,
    onYearChange,
    user,
    showTotal = true,
}: GraphDialogProps) {
    return (
        <Dialog>
            <DialogTrigger className={triggerClassName} asChild>
                {triggerContent}
            </DialogTrigger>
            <DialogContent className="sm:min-w-[80vw] w-[95vw]">
                <div className="px-4 pb-4 max-h-[70vh] overflow-auto">
                    <ContributionGraph
                        data={data}
                        selectedYear={selectedYear}
                        onYearChange={onYearChange}
                        user={user}
                        showTotal={showTotal}
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


