import glob, os, shutil

def deleteFile(f):
  try:
    if os.path.isfile(f):
      os.remove(f)
      return True
    if os.path.isdir(f):
      shutil.rmtree(f)
      return True
  except:
    pass
  return False

files = map(os.path.basename, glob.glob("dist/**"))
deleteResult = map(deleteFile, files)
totalDeleted = reduce(lambda x,y: x+1 if y else x, deleteResult, 0)

print("Deleted {} file(s).".format(totalDeleted))