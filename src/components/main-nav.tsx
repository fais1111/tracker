import Link from "next/link"
import { Menu } from "lucide-react"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

interface MainNavProps {
  items?: {
    title: string
    href?: string
    disabled?: boolean
    external?: boolean
  }[]
}

export function MainNav({ items }: MainNavProps) {
  return (
    <div className="flex items-center justify-between w-full gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <Icons.logo className="h-6 w-6 text-primary" />
        <span className="inline-block font-bold">ModuleTrack</span>
      </Link>
      {items?.length ? (
        <nav className="hidden gap-6 md:flex">
          {items?.map(
            (item, index) =>
              item.href && (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center text-sm font-medium text-muted-foreground",
                    item.disabled && "cursor-not-allowed opacity-80"
                  )}
                >
                  {item.title}
                </Link>
              )
          )}
        </nav>
      ) : null}
       <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <Link href="/" className="flex items-center space-x-2 mb-6">
                <Icons.logo className="h-6 w-6 text-primary" />
                <span className="inline-block font-bold">ModuleTrack</span>
            </Link>
            <div className="flex flex-col space-y-4">
            {items?.map(
                (item, index) =>
                item.href && (
                    <Link
                    key={index}
                    href={item.href}
                    className={cn(
                        "text-lg font-medium text-foreground hover:text-primary",
                        item.disabled && "cursor-not-allowed opacity-80"
                    )}
                    >
                    {item.title}
                    </Link>
                )
            )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
