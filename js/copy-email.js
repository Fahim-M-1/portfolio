// copy-email.js

export function initCopyEmail() {
    document.querySelectorAll('[data-action="copy-email"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const emailToCopy = "fahim.mahmud.work@gmail.com";
            const originalText = "Get in Touch";

            const showSuccess = () => {
                btn.innerText = "Email Copied!";
                setTimeout(() => {
                    btn.innerText = originalText;
                }, 2500);
            };

            const fallbackCopy = () => {
                try {
                    const textArea = document.createElement("textarea");
                    textArea.value = emailToCopy;
                    textArea.style.position = "fixed";
                    textArea.style.left = "-999999px";
                    textArea.style.top = "-999999px";
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    showSuccess();
                } catch (err) {
                    console.error('Fallback copy failed: ', err);
                }
            };

            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(emailToCopy).then(showSuccess).catch(fallbackCopy);
            } else {
                fallbackCopy();
            }
        });
    });
}
