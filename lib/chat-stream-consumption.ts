type ConsumableStreamResult = {
  consumeStream?: () => PromiseLike<void> | void;
};

export function startBackgroundStreamConsumption(
  result: ConsumableStreamResult,
  chatId: string,
): void {
  if (typeof result.consumeStream !== 'function') {
    return;
  }

  Promise.resolve()
    .then(() => result.consumeStream?.())
    .catch((error) => {
      console.error(`[Chat ${chatId}] Background stream consumption failed:`, error);
    });
}
