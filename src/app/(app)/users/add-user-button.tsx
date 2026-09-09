"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import UserFormModal from "./user-form-modal";

export default function AddUserButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Add member directly
      </Button>
      {open && <UserFormModal mode="create" onClose={() => setOpen(false)} />}
    </>
  );
}
