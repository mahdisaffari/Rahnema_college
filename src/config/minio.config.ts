import * as Minio from "minio";

export const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: parseInt(process.env.MINIO_PORT || "9000", 10),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
});



// baraye estefade roye server

// import Minio from 'minio';

//   export const minioClient = new Minio.Client({
//     endPoint: process.env.MINIO_ENDPOINT || 'your-server-ip', // تغییر از localhost
//     port: parseInt(process.env.MINIO_PORT || '9000', 10),
//     useSSL: process.env.MINIO_USE_SSL === 'true', // true برای سرور
//     accessKey: process.env.MINIO_ACCESS_KEY ,
//     secretKey: process.env.MINIO_SECRET_KEY ,
//   });