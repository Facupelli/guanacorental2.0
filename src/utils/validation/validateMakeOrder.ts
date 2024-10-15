import { type Session } from "next-auth";

export const loginError = "Debes iniciar sesión para realizar una reserva.";
export const noPetitionSentError =
  "No has enviado el alta de cliente. Para poder alquilar equipos es necesario llenar el formulario de alta de cliente.";
const noCustomerApprovedError = "Tu alta de cliente todavía no fue aprobada";
const noDatesSelectedError = "No has seleccionado una fecha de retorno o de inicio.";

type ValidOrderSubmission = {
  session: Session;
  startDate: Date;
  endDate: Date;
  workingDays: number;
};

type OrderSubmissionError = {
  error: string;
};

export function validateOrderSubmission(
  session: Session | null | undefined,
  startDate: Date | null | undefined,
  endDate: Date | null | undefined,
  workingDays: number | null | undefined
): ValidOrderSubmission | OrderSubmissionError {
  if (!session?.user) {
    return { error: loginError };
  }

  if (!startDate || !endDate || typeof workingDays !== "number") {
    return { error: noDatesSelectedError };
  }

  if (!session.user.petitionSent) {
    return { error: noPetitionSentError };
  }

  if (!session.user.customerApproved) {
    return { error: noCustomerApprovedError };
  }

  return { session, startDate, endDate, workingDays };
}

export function isValidOrderSubmission(
  result: ValidOrderSubmission | OrderSubmissionError
): result is ValidOrderSubmission {
  return (result as ValidOrderSubmission).session !== undefined;
}
