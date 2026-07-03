"use client";

import { FaPlus } from "react-icons/fa6";
import { ActionButton } from "../layout/ActionButton";
import PageHeader from "../layout/PageHeader";

export default function Header() {
  return (
    <PageHeader title="Subcription">
      <ActionButton icon={FaPlus}>Export csv</ActionButton>
    </PageHeader>
  );
}
