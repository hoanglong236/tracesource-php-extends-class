const { getChildSourceClassesByClassId } = require('./dao');



const getSourceClassesByFiles = () => {

}

const init = async () => {
  const rootSourceFiles = get


  const sourceClasses = getSourceClassesFromFiles(files);
  const getChildSourceClasses = sourceClasses.map(async (sourceClass) => {
    await getChildSourceClassesByClassId(sourceClass.id);
  }) 
}

// BUGS !!!