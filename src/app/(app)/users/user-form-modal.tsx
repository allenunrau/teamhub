"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createUserDirect, updateUser } from "@/lib/actions/users";
import { Button, FieldError, inputClass, labelClass } from "@/components/ui";
import { Modal } from "@/components/modal";

type UserData = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

type Props =
  | { mode: "create"; user?: undefined; onClose: () => void }
  | { mode: "edit"; user: UserData; onClose: () => void };

export default function UserFormModal({ mode, user, onClose }: Props) {
  const boundAction = mode === "edit" ? updateUser.bind(null, user.id) : createUserDirect;
  const [state, formAction, pending] = useActionState(boundAction, undefined);
  const submitted = useRef(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const passwordsMismatch =
    (mode === "create" || password.length > 0) && password !== confirmPassword;

  useEffect(() => {
    if (!submitted.current || pending) return;
    submitted.current = false;
    if (!state?.error) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, pending]);

  return (
    <Modal title={mode === "create" ? "Add team member" : "Edit team member"} onClose={onClose}>
      <form
        action={(formData) => {
          if (passwordsMismatch) return;
          submitted.current = true;
          formAction(formData);
        }}
        className="space-y-4"
      >
        <div>
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={user?.name}
            placeholder="Jamie Lee"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={user?.email}
            placeholder="jamie@example.com"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>
            {mode === "create" ? "Password" : "New password"}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required={mode === "create"}
            placeholder={mode === "edit" ? "Leave blank to keep current password" : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className={labelClass}>
            {mode === "create" ? "Confirm password" : "Confirm new password"}
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required={mode === "create"}
            placeholder={mode === "edit" ? "Leave blank to keep current password" : undefined}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
          />
          <FieldError>{passwordsMismatch ? "Passwords do not match." : undefined}</FieldError>
        </div>

        <div>
          <label htmlFor="role" className={labelClass}>
            Role
          </label>
          <select id="role" name="role" defaultValue={user?.role ?? "USER"} className={inputClass}>
            <option value="USER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <FieldError>{state?.error}</FieldError>

        <div className="flex justify-end pt-1">
          <Button type="submit" disabled={pending || passwordsMismatch}>
            {pending ? "Saving…" : mode === "create" ? "Create user" : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
