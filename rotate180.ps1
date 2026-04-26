Add-Type -AssemblyName System.Drawing
$imagePath = "c:\Users\Shubham\OneDrive\Desktop\Ishwari's Project\frontend\public\images\dkte-photo-rotated.jpg"
$img = [System.Drawing.Image]::FromFile($imagePath)
$img.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone)
$img.Save($imagePath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$img.Dispose()
