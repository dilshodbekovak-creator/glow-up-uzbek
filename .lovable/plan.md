
The user wants to remove two UI elements from the course detail page:

1. **"12 daq" duration labels** - appears next to each lesson in the lesson list (Modules.tsx line 167)
2. **Info row with specialist/duration/rating** - the section showing "Mutaxassis", "24 daqiqa", and "4.8 (124)" rating (Modules.tsx lines 98-109)

**Changes needed:**
- Remove the entire info row section from Modules.tsx (lines 98-109)
- Remove the duration display from each lesson item in Modules.tsx (line 167)
- Remove unused imports if they become orphaned (UserIcon, Clock, Star)

This will simplify the course detail page and remove metadata that the user doesn't want displayed.
