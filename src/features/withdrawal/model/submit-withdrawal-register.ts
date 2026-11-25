import { isAxiosError } from "axios"

import { registerChallengerDeactivation } from "../api/challenger-deactivation.api"
import { uploadWithdrawalEvidenceImages } from "../api/withdrawal-evidence-upload.api"
import { buildRegisterChallengerDeactivationBody } from "./map-withdrawal-register-reason-api"

import type { WithdrawalRegisterTarget } from "./map-challenger-to-register-target"
import type { WithdrawalRegisterFormState } from "./withdrawal-register-form"

export type SubmitWithdrawalRegisterInput = {
  target: WithdrawalRegisterTarget
  form: WithdrawalRegisterFormState
}

export type SubmitWithdrawalRegisterResult =
  | { ok: true }
  | { ok: false; kind: "validation" }
  | { ok: false; kind: "network" }
  | { ok: false; kind: "api" }

export async function submitWithdrawalRegister(
  input: SubmitWithdrawalRegisterInput,
): Promise<SubmitWithdrawalRegisterResult> {
  const body = buildRegisterChallengerDeactivationBody(input.form)
  if (body == null) {
    return { ok: false, kind: "validation" }
  }

  const { challengerId } = input.target

  try {
    const imageIds =
      input.form.imageFiles.length > 0
        ? await uploadWithdrawalEvidenceImages(input.form.imageFiles)
        : []
    const links = input.form.links.map((link) => link.trim()).filter(Boolean)

    await registerChallengerDeactivation(challengerId, {
      ...body,
      ...(imageIds.length > 0 ? { imageIds } : {}),
      ...(links.length > 0 ? { links } : {}),
    })

    return { ok: true }
  } catch (error) {
    if (isAxiosError(error) && error.response == null) {
      return { ok: false, kind: "network" }
    }
    return { ok: false, kind: "api" }
  }
}
