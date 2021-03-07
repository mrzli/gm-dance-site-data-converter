export function scriptExecutor(script: () => Promise<void>): void {
  script()
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      console.log('Finished!');
    });
}
