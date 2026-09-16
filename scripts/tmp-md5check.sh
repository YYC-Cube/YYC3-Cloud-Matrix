#!/bin/bash
B="/Users/yanyu/Downloads/YYC3-CloudPivot-Matrix-集成/YYC3-Cloud-Matrix"
C="/Users/yanyu/YYC-Cube/YYC3-Cloud-Matrix"
echo "== md5 compare: B/public vs C/public/Music-Mp3 =="
for f in 沫言-AI-Family.mp3 沫言-Family-AI-智慧工坊.mp3 沫言-Family-AI.mp3; do
  a=$(md5 -q "$B/public/$f" 2>/dev/null)
  b=$(md5 -q "$C/public/Music-Mp3/$f" 2>/dev/null)
  if [ "$a" = "$b" ] && [ -n "$a" ]; then echo "$f: SAME"; else echo "$f: DIFF"; fi
done
echo
echo "== B components/ai-family file count =="
ls "$B/src/app/components/ai-family" 2>/dev/null | wc -l
echo
echo "== C uncommitted (non-untracked) =="
git -C "$C" status --short | grep -v "^??"
