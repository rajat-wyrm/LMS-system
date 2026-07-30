/* eslint-disable no-console */

async function main() {
  console.log('Database seed is intentionally empty. Demo instructors and demo courses are disabled in pr-96.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
