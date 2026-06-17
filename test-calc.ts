import { calculateActiveSeats } from './src/app/actions/enrollments';

async function run() {
  try {
    const count = await calculateActiveSeats();
    console.log("Active count:", count);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
