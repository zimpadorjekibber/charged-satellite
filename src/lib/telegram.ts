
const TELEGRAM_BOT_TOKEN = '8206987725:AAHVttz0Tmlq82ZIgoOHLOVXGu251SOnv6g';
const TELEGRAM_CHAT_ID = '-5036544253';

export async function sendTelegramAlert(message: string) {
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML',
            }),
        });
    } catch (error) {
        console.error('Failed to send Telegram alert:', error);
    }
}
