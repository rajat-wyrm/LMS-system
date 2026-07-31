const { prisma } = require('../config/db');
const { clearCache } = require('../middlewares/cache.middleware');


// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res, next) => {
  try {

    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      category,
      level
    } = req.query;


    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;


    const where = {
      status: 'approved',
      isDeleted: false
    };


    if (category) where.category = category;

    if (level) where.level = level;


    if (search) {

      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          instructor: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ];

    }


    const orderBy = {};

    if (sortBy) {
      orderBy[sortBy] =
        sortOrder === 'asc'
          ? 'asc'
          : 'desc';
    }



    const [courses, total] = await Promise.all([

      prisma.course.findMany({

        where,

        include: {

          instructor:{
            select:{
              id:true,
              name:true,
              email:true
            }
          },

          lessons:true,

          _count:{
            select:{
              enrollments:true
            }
          }

        },

        skip,
        take:limitNumber,
        orderBy

      }),



      prisma.course.count({
        where
      })

    ]);



    res.status(200).json({

      success:true,

      count:courses.length,

      data:courses,

      meta:{

        total,

        page:pageNumber,

        limit:limitNumber,

        totalPages:Math.ceil(total / limitNumber)

      }

    });


  } catch(error){

    next(error);

  }

};




// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public

exports.getCourse = async (req,res,next)=>{

  try{


    const course = await prisma.course.findFirst({

      where:{

        id:req.params.id,

        isDeleted:false

      },


      include:{

        instructor:{

          select:{

            id:true,
            name:true,
            email:true

          }

        },


        lessons:{

          orderBy:{

            order:'asc'

          }

        },


        _count:{

          select:{

            enrollments:true

          }

        }


      }

    });



    if(!course){

      return res.status(404).json({

        success:false,

        error:"Course not found"

      });

    }



    if(course.status !== 'approved'){


      const isOwner =
        req.user &&
        course.instructorId === req.user.id;


      const isAdmin =
        req.user &&
        req.user.role === 'admin';



      if(!isOwner && !isAdmin){

        return res.status(404).json({

          success:false,

          error:"Course not found"

        });

      }

    }



    res.status(200).json({

      success:true,

      data:course

    });



  }catch(error){

    next(error);

  }

};




// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Admin)

exports.createCourse = async(req,res,next)=>{


try{


if(req.user.role !== 'admin'){

return res.status(403).json({

success:false,

error:'Only admins can create courses'

});

}



const {

title,
description,
category,
level,
thumbnail,
price,
duration,
rating,
outcomes,
xp,
gradient,
icon,
status,
generateAI

}=req.body;



const categoryRecord =
await prisma.category.findUnique({

where:{
name:category
}

});



if(!categoryRecord){

return res.status(400).json({

success:false,

error:'Category not found'

});

}




const course = await prisma.course.create({

data:{


title,

description,

category,

categoryId:categoryRecord.id,

level,

thumbnail,

price:price ? parseFloat(price):0,

duration:duration || 'Self-paced',

rating:rating ? parseFloat(rating):4.5,

outcomes:outcomes || [],

xp:xp || '1000 XP',

gradient:gradient || 'from-blue-600 via-blue-500 to-cyan-400',

icon:icon || '🤖',

status:status || 'approved',

instructorId:req.user.id


}


});



await clearCache('cache:/api/courses');


res.status(201).json({

success:true,

data:course

});



}catch(error){

next(error);

}


};
// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin)

exports.updateCourse = async (req,res,next)=>{

try{


const course = await prisma.course.findUnique({

where:{
id:req.params.id
}

});


if(!course){

return res.status(404).json({

success:false,

error:"Course not found"

});

}



if(req.user.role !== "admin"){

return res.status(403).json({

success:false,

error:"Not authorized. Admin only."

});

}



const dataToUpdate = {...req.body};



if(dataToUpdate.category !== undefined){


const categoryRecord =
await prisma.category.findUnique({

where:{
name:dataToUpdate.category
}

});


if(!categoryRecord){

return res.status(400).json({

success:false,

error:"Category not found"

});

}


dataToUpdate.categoryId = categoryRecord.id;


}



if(dataToUpdate.price !== undefined){

dataToUpdate.price =
parseFloat(dataToUpdate.price) || 0;

}



if(dataToUpdate.rating !== undefined){

dataToUpdate.rating =
parseFloat(dataToUpdate.rating) || 4.5;

}



const updated = await prisma.course.update({

where:{
id:req.params.id
},

data:dataToUpdate

});



await clearCache('cache:/api/courses');



res.status(200).json({

success:true,

data:updated

});



}catch(error){

next(error);

}


};





// @desc    Soft delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin)

exports.deleteCourse = async(req,res,next)=>{


try{


const course = await prisma.course.findUnique({

where:{
id:req.params.id
}

});



if(!course){

return res.status(404).json({

success:false,

error:"Course not found"

});

}



if(req.user.role !== "admin"){

return res.status(403).json({

success:false,

error:"Admin only"

});

}




const deletedCourse = await prisma.course.update({

where:{
id:req.params.id
},


data:{


isDeleted:true,


deletedAt:new Date()


}


});



await clearCache('cache:/api/courses');



res.status(200).json({

success:true,

message:"Course soft deleted successfully",

data:deletedCourse

});



}catch(error){

next(error);

}


};







// @desc    Restore deleted course
// @route   PATCH /api/courses/:id/restore
// @access  Private (Admin)


exports.restoreCourse = async(req,res,next)=>{


try{


const course = await prisma.course.findUnique({

where:{
id:req.params.id
}

});



if(!course){

return res.status(404).json({

success:false,

error:"Course not found"

});

}




if(req.user.role !== "admin"){

return res.status(403).json({

success:false,

error:"Admin only"

});

}




const restoredCourse = await prisma.course.update({

where:{
id:req.params.id
},


data:{


isDeleted:false,


deletedAt:null


}


});



await clearCache('cache:/api/courses');



res.status(200).json({

success:true,

message:"Course restored successfully",

data:restoredCourse

});



}catch(error){

next(error);

}


};







// @desc    Add lesson to course
// @route   POST /api/courses/:courseId/lessons
// @access  Private (Admin)

exports.addLesson = async(req,res,next)=>{


try{


const course = await prisma.course.findUnique({

where:{
id:req.params.courseId
}

});



if(!course){

return res.status(404).json({

success:false,

error:"Course not found"

});

}




if(req.user.role !== "admin"){

return res.status(403).json({

success:false,

error:"Admin only"

});

}




const {

title,

content,

videoUrl,

order

}=req.body;




const lesson = await prisma.lesson.create({

data:{


title,

content,

videoUrl,

order:Number(order),

courseId:req.params.courseId


}

});



await clearCache('cache:/api/courses');



res.status(201).json({

success:true,

data:lesson

});



}catch(error){

next(error);

}


};
// @desc    Delete lesson from course
// @route   DELETE /api/courses/:courseId/lessons/:lessonId
// @access  Private (Admin)

exports.deleteLesson = async(req,res,next)=>{

try{


const course = await prisma.course.findUnique({

where:{
id:req.params.courseId
}

});


if(!course){

return res.status(404).json({

success:false,

error:"Course not found"

});

}



if(req.user.role !== "admin"){

return res.status(403).json({

success:false,

error:"Admin only"

});

}




const lesson = await prisma.lesson.findUnique({

where:{
id:req.params.lessonId
}

});



if(!lesson || lesson.courseId !== req.params.courseId){

return res.status(404).json({

success:false,

error:"Lesson not found"

});

}




await prisma.lesson.delete({

where:{
id:req.params.lessonId
}

});



await clearCache('cache:/api/courses');



res.status(200).json({

success:true,

message:"Lesson deleted successfully"

});



}catch(error){

next(error);

}

};







// @desc    Get instructor statistics
// @route   GET /api/courses/instructor/stats
// @access  Private


exports.getInstructorStats = async(req,res,next)=>{


try{


const instructorId = req.user.id;



const courses = await prisma.course.findMany({

where:{

instructorId,

isDeleted:false

},


select:{

id:true,

price:true

}


});



const courseIds = courses.map(c=>c.id);



const enrollments = await prisma.enrollment.findMany({

where:{

courseId:{
in:courseIds
}

},


include:{

course:{

select:{

price:true

}

}

}


});



const totalStudents = enrollments.length;


const totalCourses = courses.length;



const totalRevenue = enrollments.reduce(

(sum,enr)=>sum+(enr.course?.price || 0),

0

);



res.status(200).json({

success:true,

data:{

totalStudents,

totalCourses,

totalRevenue

}

});



}catch(error){

next(error);

}


};







// @desc    Get all learning paths
// @route   GET /api/courses/learning-paths
// @access  Public


exports.getLearningPaths = async(req,res,next)=>{


try{


const paths = await prisma.learningPath.findMany({

include:{

courses:{

where:{

isDeleted:false

},


select:{

id:true,

title:true,

duration:true,

thumbnail:true

}


}

}

});



res.status(200).json({

success:true,

data:paths

});



}catch(error){

next(error);

}


};







// @desc    Generate course lessons with AI
// @route   POST /api/courses/:courseId/generate-lessons
// @access  Private (Admin)


exports.generateLessonsAI = async(req,res,next)=>{


try{


const courseId = req.params.courseId;



const course = await prisma.course.findUnique({

where:{
id:courseId
},

include:{
lessons:true
}

});



if(!course){

return res.status(404).json({

success:false,

error:"Course not found"

});

}




if(req.user.role !== "admin"){

return res.status(403).json({

success:false,

error:"Admin only"

});

}





await prisma.lesson.deleteMany({

where:{

courseId

}

});




const {
generateLessonsForCourse
} = require('../utils/aiGenerator');



const lessonsData =
await generateLessonsForCourse(

course.title,

course.category,

course.level

);




const createdLessons = [];



for(const lesson of lessonsData){


const created =
await prisma.lesson.create({

data:{


title:lesson.title,

content:lesson.content,

videoUrl:lesson.videoUrl,

order:lesson.order,

courseId


}

});


createdLessons.push(created);


}




await prisma.course.update({

where:{

id:courseId

},


data:{

duration:`${lessonsData.length * 20} Mins`

}

});




await clearCache('cache:/api/courses');



res.status(200).json({

success:true,

data:createdLessons

});



}catch(error){

next(error);

}


};