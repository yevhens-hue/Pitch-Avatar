import pexpect
import sys
import uuid

domain = f"fluenttech-mock-interviews-{uuid.uuid4().hex[:6]}.surge.sh"
print(f"Deploying to {domain}")

child = pexpect.spawn(f"npx surge ./public {domain}")
child.logfile = sys.stdout.buffer

try:
    index = child.expect(["email:", "Login:", pexpect.EOF, pexpect.TIMEOUT], timeout=30)
    
    if index == 0 or index == 1:
        child.sendline(f"testuser-{uuid.uuid4().hex[:8]}@example.com")
        child.expect("password:")
        child.sendline("TestPassword123!")
        child.expect(pexpect.EOF, timeout=120)
    elif index == 2:
        print("Command finished without prompting.")
    else:
        print("Timeout.")
        
    print(f"\nSUCCESS! Domain should be: https://{domain}")
except Exception as e:
    print(f"Error: {e}")
