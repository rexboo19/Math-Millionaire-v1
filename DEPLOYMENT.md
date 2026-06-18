# How to Host Your Math Millionaire Game on GitHub Pages

## Quick Steps to Deploy on GitHub Pages

### Option 1: Using GitHub Web Interface (Easiest)

1. **Create a GitHub Account** (if you don't have one)
   - Go to [github.com](https://github.com) and sign up

2. **Create a New Repository**
   - Click the "+" icon in the top right corner
   - Select "New repository"
   - Name it (e.g., `math-millionaire` or `millionaire-game`)
   - Make it **Public** (required for free GitHub Pages)
   - **Don't** initialize with README, .gitignore, or license
   - Click "Create repository"

3. **Upload Your Files**
   - On the repository page, click "uploading an existing file"
   - Drag and drop all your files:
     - `index.html`
     - `admin.html`
     - `styles.css`
     - `admin-styles.css`
     - `script.js`
     - `admin-script.js`
     - `README.md`
     - The `sounds/` folder (drag the entire folder)
   - Scroll down and click "Commit changes"

4. **Enable GitHub Pages**
   - Go to your repository settings (click "Settings" tab)
   - Scroll down to "Pages" in the left sidebar
   - Under "Source", select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"
   - Wait a few minutes for GitHub to build your site

5. **Access Your Website**
   - Your site will be available at: `https://yourusername.github.io/repository-name/`
   - GitHub will show you the URL in the Pages settings

### Option 2: Using Git Command Line (For Developers)

1. **Initialize Git Repository** (in your project folder)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create Repository on GitHub**
   - Create a new repository on GitHub (same as Option 1, step 2)

3. **Connect and Push**
   ```bash
   git remote add origin https://github.com/yourusername/repository-name.git
   git branch -M main
   git push -u origin main
   ```

4. **Enable GitHub Pages** (same as Option 1, step 4)

## Alternative Hosting Options

### Netlify (Recommended Alternative)
- **Free** and very easy to use
- Drag and drop your folder at [netlify.com](https://netlify.com)
- Automatic HTTPS and custom domain support
- URL: `https://your-site-name.netlify.app`

### Vercel
- **Free** hosting for static sites
- Connect your GitHub repository for automatic deployments
- URL: `https://your-site-name.vercel.app`

### GitHub Pages Benefits
- ✅ **Free** forever
- ✅ **HTTPS** included
- ✅ **Custom domain** support
- ✅ Easy updates (just push changes)
- ✅ Version control built-in

## Important Notes

1. **File Paths**: All your file paths should be relative (which they already are - good!)
   - ✅ `href="styles.css"` (correct)
   - ❌ `href="/styles.css"` (might not work on GitHub Pages)

2. **Case Sensitivity**: GitHub Pages is case-sensitive
   - Make sure file names match exactly (e.g., `index.html` not `Index.html`)

3. **Update Your Site**: After making changes
   - Upload/push the updated files
   - Changes appear within 1-2 minutes

4. **Admin Page**: Your `admin.html` will be accessible at:
   - `https://yourusername.github.io/repository-name/admin.html`

## Troubleshooting

- **404 Error**: Make sure `index.html` is in the root folder
- **Styles not loading**: Check that CSS file paths are correct
- **Images not showing**: Verify image paths are relative, not absolute
- **Site not updating**: Clear browser cache or wait a few minutes

## Need Help?

- GitHub Pages Documentation: [pages.github.com](https://pages.github.com)
- GitHub Support: [support.github.com](https://support.github.com)

---

**Your game will be live and accessible to anyone with the URL!** 🚀

