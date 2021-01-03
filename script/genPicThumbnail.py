from PIL import Image
import os
import glob

height = 225.0
width = -1 # Auto

parent = './photos/'
subcategories = ['cityscape', 'myself', 'naturalhistory']

for cat in subcategories:
# cat = 'naturalhistory'
    imagedir = os.path.join(parent, cat)
    thumbdir = os.path.join(imagedir, 'thumb')

    imglist = glob.glob(os.path.join(imagedir, '*.jpg'))
    thumblist = glob.glob(os.path.join(thumbdir, '*.jpg'))

    imglist += glob.glob(os.path.join(imagedir, '*.png'))
    thumblist += glob.glob(os.path.join(thumbdir, '*.png'))

    imglist = [im.split('/')[-1] for im in imglist]
    thumblist = [th.split('/')[-1] for th in thumblist]

    existed_thumbs = [thn[6:] for thn in thumblist]

    diff_list = set(imglist).difference(set(existed_thumbs))

    log = cat + " new images: " + str(diff_list)
    print(log)

    for img in diff_list:
        img_p = os.path.join(imagedir, img)
        log = "     Generating: " + img_p
        print(log)
        im = Image.open(img_p)
        ratio = height / im.height
        im.thumbnail((im.width * ratio, height))
        im.save(os.path.join(thumbdir, 'thumb_'+img))
