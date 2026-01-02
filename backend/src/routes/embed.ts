import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';

const router = Router();

// Serve embeddable button script
router.get('/button.js', async (req: Request, res: Response) => {
  try {
    const publicKey = req.query.key as string;

    if (!publicKey) {
      return res.status(400).send('// Error: Public key is required');
    }

    // Verify public key exists
    const business = await prisma.business.findUnique({
      where: { publicKey }
    });

    if (!business) {
      return res.status(404).send('// Error: Invalid public key');
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // Generate the embeddable script
    const script = `
(function() {
  var seamlessAuthConfig = {
    publicKey: '${publicKey}',
    backendUrl: '${backendUrl}',
    frontendUrl: '${frontendUrl}'
  };

  function createAuthButton() {
    var container = document.getElementById('seamless-auth-container');
    if (!container) {
      console.error('SeamlessAuth: Container element with id "seamless-auth-container" not found');
      return;
    }

    var iframe = document.createElement('iframe');
    iframe.src = seamlessAuthConfig.frontendUrl + '/auth-button?key=' + seamlessAuthConfig.publicKey;
    iframe.style.width = '100%';
    iframe.style.height = '400px';
    iframe.style.border = 'none';
    iframe.id = 'seamless-auth-iframe';
    
    container.appendChild(iframe);

    // Listen for messages from iframe
    window.addEventListener('message', function(event) {
      if (event.origin !== seamlessAuthConfig.frontendUrl) {
        return;
      }

      if (event.data.type === 'SEAMLESS_AUTH_SUCCESS') {
        var customEvent = new CustomEvent('seamlessAuthSuccess', {
          detail: {
            token: event.data.token,
            user: event.data.user
          }
        });
        window.dispatchEvent(customEvent);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createAuthButton);
  } else {
    createAuthButton();
  }
})();
`;

    res.setHeader('Content-Type', 'application/javascript');
    res.send(script);
  } catch (error) {
    console.error('Embed button error:', error);
    res.status(500).send('// Error: Internal server error');
  }
});

export default router;
