# Voiceflow Custom Web Chat Extension: ext_darkForm

## Overview

This extension (`ext_darkForm.js`) provides a professional dark-themed medical form that captures patient information and health report file uploads within the Voiceflow chat widget.

## Features

- **Dark Theme**: Professional medical form with dark color scheme
- **Form Fields**:
  - Patient Name (required)
  - Phone Number (required)
  - Email Address (required)
  - Patient Symptoms (required, textarea)
  - Health Report File Upload (required, supports PDF, DOC, DOCX, JPG, JPEG, PNG)
- **File Handling**: Converts uploaded files to Base64 using FileReader API
- **Validation**: Client-side validation with error messages
- **Voiceflow Integration**: Sends data back to Voiceflow using `window.voiceflow.chat.interact()`

## Payload Structure

The extension sends data to Voiceflow with the following payload keys:

```javascript
{
  type: 'complete',
  payload: {
    name: string,        // Patient name
    phone: string,       // Phone number
    email: string,       // Email address
    symptoms: string,    // Patient symptoms description
    reportFile: string   // Base64 encoded file string
  }
}
```

## Installation

### Option 1: Host the Extension File

1. Host the `ext_darkForm.js` file on your server or CDN
2. Add the script to your Voiceflow project settings as a Custom Web Chat Extension
3. The extension will automatically initialize when Voiceflow loads

### Option 2: Load in Your Application

Add the script tag to your HTML or load it programmatically:

```html
<script src="/ext_darkForm.js"></script>
```

Or in your React component:

```javascript
useEffect(() => {
  const script = document.createElement('script');
  script.src = '/ext_darkForm.js';
  script.async = true;
  document.head.appendChild(script);
}, []);
```

## Usage in Voiceflow

### Method 1: Trigger via Custom Action

In your Voiceflow project, create a custom action named `ext_darkForm`. When this action is triggered, the form will automatically render.

### Method 2: Manual Trigger

You can manually trigger the form by dispatching an event:

```javascript
document.dispatchEvent(new CustomEvent('voiceflow:action', {
  detail: { action: 'ext_darkForm' }
}));
```

### Method 3: Direct Function Call

If the extension is loaded, you can call the render function directly:

```javascript
// The form will render automatically when Voiceflow requests it
// Or trigger it manually:
if (window.renderDarkForm) {
  window.renderDarkForm();
}
```

## Voiceflow Variable Mapping

Make sure your Voiceflow project has variables set up to receive the form data:

- `name` - Patient name
- `phone` - Phone number
- `email` - Email address
- `symptoms` - Patient symptoms
- `reportFile` - Base64 encoded health report file

## File Size Considerations

- The extension accepts files up to reasonable sizes (typically 10-50MB depending on browser)
- Large files will take longer to convert to Base64
- Consider file size limits in your Voiceflow backend processing

## Styling Customization

The extension includes embedded CSS styles. To customize:

1. Modify the styles in `ext_darkForm.js` within the `<style>` tag
2. Or override styles using CSS with higher specificity:

```css
.vf-dark-form-container {
  /* Your custom styles */
}
```

## Browser Compatibility

- Modern browsers with FileReader API support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers may have file upload limitations

## Troubleshooting

### Form Not Appearing

1. Check browser console for errors
2. Verify Voiceflow chat widget is loaded
3. Ensure the extension script is loaded after Voiceflow
4. Check that the custom action name matches `ext_darkForm`

### File Upload Issues

1. Verify file type is accepted (PDF, DOC, DOCX, JPG, JPEG, PNG)
2. Check file size isn't too large
3. Ensure browser allows file access

### Data Not Reaching Voiceflow

1. Verify `window.voiceflow.chat.interact` is available
2. Check browser console for errors
3. Verify payload keys match your Voiceflow variable names
4. Check Voiceflow project logs for received data

## Example Integration

```javascript
// In your VoiceflowChat component or similar
useEffect(() => {
  // Load Voiceflow
  const vfScript = document.createElement('script');
  vfScript.src = 'https://cdn.voiceflow.com/widget-next/bundle.mjs';
  vfScript.async = true;
  vfScript.onload = () => {
    window.voiceflow.chat.load({ /* config */ });
    
    // Load extension after Voiceflow
    const extScript = document.createElement('script');
    extScript.src = '/ext_darkForm.js';
    extScript.async = true;
    document.head.appendChild(extScript);
  };
  document.head.appendChild(vfScript);
}, []);
```

## Security Notes

- File data is converted to Base64 client-side
- No data is sent to external servers (only to Voiceflow)
- Consider implementing file size limits
- Validate file types server-side in production
- Ensure HIPAA compliance for medical data handling

