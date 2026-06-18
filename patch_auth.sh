#!/bin/bash
FILE="src/components/Coach/TrainModeUI/TrainModeUI.tsx"

# Add supabase import
sed -i '' 's/import { Zap, Play, Upload, MessageSquare, ChevronDown, Check, X, Plus } from .lucide-react.;/import { Zap, Play, Upload, MessageSquare, ChevronDown, Check, X, Plus } from "lucide-react";\nimport { supabase } from "@\/lib\/supabase";/' "$FILE"

# Replace fetch calls
sed -i '' 's/headers: { .Content-Type.: .application\/json. },/headers: { "Content-Type": "application\/json", ...(await supabase.auth.getSession()).data.session?.access_token ? { Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` } : {} },/g' "$FILE"

