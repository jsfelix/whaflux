import qrcode from 'qrcode-terminal'
import { Client, RemoteAuth } from 'whatsapp-web.js'
import { AwsS3Store } from 'wwebjs-aws-s3'

import { env } from '@/config/env'
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'

const s3 = new S3Client({
  region: env.AWS_REGION ?? 'us-east-1',
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY ?? '',
  },
})

const store = new AwsS3Store({
  bucketName: env.AWS_S3_BUCKET_NAME,
  remoteDataPath: 'sessions/',
  s3Client: s3,
  putObjectCommand: PutObjectCommand,
  headObjectCommand: HeadObjectCommand,
  getObjectCommand: GetObjectCommand,
  deleteObjectCommand: DeleteObjectCommand,
})

export const waClient = new Client({
  authStrategy: new RemoteAuth({
    dataPath: './.wwebjs_auth',
    store,
    backupSyncIntervalMs: 60000,
  }),
})

console.info('Starting server...')

waClient.on('qr', qr => {
  console.info('WhaFlux v0.0.1')
  console.info('==============')
  console.info('')
  console.info(
    'To connect your session, please read the QR Code bellow in your WhatsApp:',
  )
  qrcode.generate(qr, { small: true })
})

waClient.on('authenticated', () => {
  console.info('Authenticated')
})

waClient.on('auth_failure', msg => {
  console.info('Authentication failed')
  console.info(msg)
})

waClient.on('change_state', state => {
  console.info('State changed: ', state)
})

waClient.on('disconnected', reason => {
  console.info('Client disconnected:', reason)
})

waClient.on('ready', async () => {
  console.info('Client is ready!')
})
