"use client";

import * as React from "react";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";

import { GripVerticalIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof PanelGroup>) {
  return (
    <PanelGroup
      className={cn("flex h-full w-full", className)}
      {...props}
    />
  );
}

export function ResizablePanel({
  className,
  ...props
}: React.ComponentProps<typeof Panel>) {
  return (
    <Panel
      className={cn("h-full w-full", className)}
      {...props}
    />
  );
}

export function ResizableHandle({
  className,
  ...props
}: React.ComponentProps<typeof PanelResizeHandle>) {
  return (
    <PanelResizeHandle
      className={cn(
        "flex w-1 items-center justify-center bg-border hover:bg-accent",
        className
      )}
      {...props}
    >
      <GripVerticalIcon className="h-3 w-3" />
    </PanelResizeHandle>
  );
}