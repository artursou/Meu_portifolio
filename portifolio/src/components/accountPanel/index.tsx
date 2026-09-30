"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Form, FormGroup, Label, Input, SubmitButton } from "../adminPage/styles";

// Mesmas regras configuradas no Supabase Auth (o servidor valida de novo)
const RULES = [
  { label: "Pelo menos 8 caracteres", test: (s: string) => s.length >= 8 },
  { label: "Uma letra minúscula", test: (s: string) => /[a-z]/.test(s) },
  { label: "Uma letra maiúscula", test: (s: string) => /[A-Z]/.test(s) },
  { label: "Um número", test: (s: string) => /[0-9]/.test(s) },
  { label: "Um símbolo (ex.: ! @ # $ % & *)", test: (s: string) => /[^A-Za-z0-9]/.test(s) },
];

export function AccountPanel({ onError, onSuccess }: {
  onError: (message: string) => void;
  onSuccess: () => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const allRulesOk = RULES.every((rule) => rule.test(newPassword));
  const matches = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (saving || !allRulesOk || !matches) return;
    if (newPassword === currentPassword) return onError("A nova senha precisa ser diferente da atual.");
    setSaving(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.email) throw new Error("Sessão expirada. Entre novamente.");

      // Confirma a senha atual antes de trocar (protege uma sessão deixada aberta)
      const { error: checkError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword });
      if (checkError) throw new Error("A senha atual está incorreta.");

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error(`Não foi possível trocar a senha: ${error.message}`);

      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      onSuccess();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Erro inesperado ao trocar a senha.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h2 style={{ margin: 0, fontSize: 20 }}>Trocar senha</h2>

      <FormGroup>
        <Label htmlFor="current-password">Senha atual</Label>
        <Input id="current-password" type="password" autoComplete="current-password" required
          value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="new-password">Nova senha</Label>
        <Input id="new-password" type="password" autoComplete="new-password" required
          value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 0", fontSize: 13, display: "grid", gap: 4 }}>
          {RULES.map((rule) => {
            const ok = rule.test(newPassword);
            return (
              <li key={rule.label} style={{ color: ok ? "#4ade80" : "#aaa" }}>
                {ok ? "✓" : "○"} {rule.label}
              </li>
            );
          })}
        </ul>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="confirm-password">Confirmar nova senha</Label>
        <Input id="confirm-password" type="password" autoComplete="new-password" required
          value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        {confirmPassword.length > 0 && !matches && (
          <span style={{ fontSize: 13, color: "#f87171" }}>As senhas não coincidem.</span>
        )}
      </FormGroup>

      <SubmitButton type="submit" disabled={saving || !allRulesOk || !matches}
        style={{ opacity: saving || !allRulesOk || !matches ? 0.5 : 1 }}>
        {saving ? "Salvando..." : "Trocar senha"}
      </SubmitButton>
    </Form>
  );
}
