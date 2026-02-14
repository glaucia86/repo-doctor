export function renderCancelJobButton(disabled: boolean): string {
  return `<button id="cancel-job" type="button"${disabled ? " disabled" : ""}>Cancel job</button>`;
}

export async function handleCancelJobAction(
  cancelFn: () => Promise<{ status: string }>
): Promise<string> {
  const result = await cancelFn();
  return result.status;
}
