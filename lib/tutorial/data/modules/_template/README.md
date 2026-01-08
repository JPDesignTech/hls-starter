# Tutorial Content Templates

This directory contains templates and examples for creating new tutorial lessons and modules.

## Quick Start

### Creating a New Lesson

1. **Copy the template**:
   ```bash
   cp lesson-template.ts ../your-module/your-lesson-id.ts
   ```

2. **Update the file**:
   - Change export name to camelCase (e.g., `yourLessonId`)
   - Update `id` to kebab-case (e.g., `your-lesson-id`)
   - Fill in `title`, `module`, `duration`
   - Set `unlockAfter` to previous lesson ID (or remove if first lesson)
   - Replace template content blocks with your actual content

3. **Add to module index**:
   - Open `../your-module/index.ts`
   - Import your new lesson: `import { yourLessonId } from './your-lesson-id';`
   - Add to `lessons` array

### Creating a New Module

1. **Create module directory**:
   ```bash
   mkdir ../your-module-name
   ```

2. **Copy module index template**:
   ```bash
   cp module-index-template.ts ../your-module-name/index.ts
   ```

3. **Create lessons** following the lesson template

4. **Update main data registry**:
   - Open `../../index.ts`
   - Import your module: `import { yourModuleNameModule } from './modules/your-module-name';`
   - Add to `modules` array

## Content Block Quick Reference

| Block Type | Use Case | Required Fields |
|------------|----------|----------------|
| `introduction` | Lesson intro | `heading`, `content` |
| `text` | Explanatory content | `content` |
| `code` | FFmpeg commands | `command` |
| `bullets` | Lists/summaries | `heading`, `bullets` |
| `challenge` | Interactive practice | `title`, `description`, `requirements`, `hints`, `solution` |
| `preview` | Visual demos | `heading`, `content`, `code`, `previewType`, `sampleVideoId` |
| `quiz` | Knowledge checks | `question`, `options`, `explanation` |

## Best Practices

- ✅ Start with an introduction block
- ✅ Use code blocks with `flagBreakdown` for complex commands
- ✅ Include challenges for hands-on practice
- ✅ End with quizzes to test understanding
- ✅ Set appropriate `unlockAfter` for lesson progression
- ✅ Estimate duration realistically (reading + practice time)

- ❌ Don't skip the introduction
- ❌ Don't create quizzes without exactly one correct answer
- ❌ Don't forget to add lessons to module index
- ❌ Don't use vague challenge requirements
- ❌ Don't forget to update `unlockAfter` chains

## Examples

See existing lessons in:
- `../fundamentals/` - Basic concepts
- `../video-processing/` - Video manipulation
- `../audio-processing/` - Audio processing

## Need Help?

Refer to `.cursorrules` in the project root for detailed guidelines and examples.
