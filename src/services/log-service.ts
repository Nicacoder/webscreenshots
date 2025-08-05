export class LogService {
  start(text: string) {
    console.log(`${text}...`);
  }

  success(text: string) {
    console.log(`✅ ${text}`);
  }

  warning(text: string) {
    console.error(`⚠️  ${text}`);
  }

  error(text: string) {
    console.error(`❌ ${text}`);
  }

  info(text: string) {
    console.log(`ℹ ${text}`);
  }

  log(msg: string) {
    console.log(msg);
  }
}
