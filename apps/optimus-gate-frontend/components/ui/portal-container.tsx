"use client";

import {
  createContext,
  useContext,
  type RefObject,
} from "react";

type PortalContainerRef = RefObject<HTMLElement | ShadowRoot | null>;

const PortalContainerContext = createContext<PortalContainerRef | null>(null);

export function PortalContainerProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: PortalContainerRef;
}) {
  return (
    <PortalContainerContext.Provider value={value}>
      {children}
    </PortalContainerContext.Provider>
  );
}

export function usePortalContainer() {
  return useContext(PortalContainerContext);
}
