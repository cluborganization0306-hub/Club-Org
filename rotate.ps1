Add-Type -AssemblyName System.Drawing
$imagePath = "C:\Users\Shubham\.gemini\antigravity\brain\8cd4de2f-3fe5-40fd-9de1-c973ef8acfc3\media__1777233285206.jpg"
$outputPath = "c:\Users\Shubham\OneDrive\Desktop\Ishwari's Project\frontend\public\images\dkte-photo-rotated.jpg"
$img = [System.Drawing.Image]::FromFile($imagePath)
$img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone)
$img.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$img.Dispose()
