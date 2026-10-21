"use client";

import { useEffect, useState, useTransition } from "react";
import {
  startRegistration,
  browserSupportsWebAuthn,
} from "@simplewebauthn/browser";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  listMyPasskeys,
  startPasskeyRegistration,
  finishPasskeyRegistration,
  deletePasskey,
} from "@/lib/actions/passkeys";

export default function BiometricSetup() {
  const { showToast } = useToast();
  const [supported, setSupported] = useState(false);
  const [keys, setKeys] = useState<
    { id: string; device_name: string | null; created_at: string }[]
  >([]);
  const [pending, startTransition] = useTransition();

  function refresh() {
    startTransition(async () => {
      const list = await listMyPasskeys();
      setKeys(list);
    });
  }

  useEffect(() => {
    setSupported(browserSupportsWebAuthn());
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!supported) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-4 space-y-1">
        <p className="text-sm font-semibold text-text-primary">Biometric Login</p>
        <p className="text-xs text-text-muted">
          This device does not support Fingerprint / Face ID passkeys.
        </p>
      </div>
    );
  }

  function enable() {
    startTransition(async () => {
      const start = await startPasskeyRegistration();
      if (!start.success) {
        showToast(start.error, "error");
        return;
      }
      try {
        const attResp = await startRegistration({ optionsJSON: start.options });
        const finish = await finishPasskeyRegistration(
          attResp,
          typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 80) : "Device"
        );
        if (!finish.success) {
          showToast(finish.error, "error");
          return;
        }
        showToast("Biometric login enabled", "success");
        const list = await listMyPasskeys();
        setKeys(list);
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Cancelled or failed";
        if (!/cancel|abort/i.test(msg)) showToast(msg, "error");
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const res = await deletePasskey(id);
      if (!res.success) showToast(res.error, "error");
      else {
        showToast("Passkey removed", "success");
        setKeys((k) => k.filter((x) => x.id !== id));
      }
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
      <div>
        <p className="text-sm font-semibold text-text-primary">Biometric Login</p>
        <p className="text-xs text-text-muted mt-0.5">
          Use Fingerprint or Face ID instead of your password on this device.
        </p>
      </div>
      {keys.length > 0 && (
        <ul className="space-y-2">
          {keys.map((k) => (
            <li
              key={k.id}
              className="flex items-center justify-between gap-2 text-sm bg-primary-light/40 rounded-xl px-3 py-2"
            >
              <span className="truncate text-text-primary">
                {k.device_name || "Passkey"}
              </span>
              <button
                type="button"
                disabled={pending}
                onClick={() => remove(k.id)}
                className="text-xs font-semibold text-error shrink-0"
              >
                Disable
              </button>
            </li>
          ))}
        </ul>
      )}
      <Button
        type="button"
        variant="secondary"
        fullWidth
        loading={pending}
        onClick={enable}
      >
        Enable Fingerprint / Face ID
      </Button>
    </div>
  );
}
