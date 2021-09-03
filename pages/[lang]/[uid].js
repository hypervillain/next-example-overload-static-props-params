import fs from 'fs'
import path from 'path'

const UidsFilePath = path.join(process.cwd(), 'uids.json')

const _documents = [
  {
    type: 'page',
    uid: '1',
    id: 'xx1',
    lang: 'fr'
  },
  {
    type: 'page',
    uid: '4',
    id: 'xx0',
    lang: 'fr'
  },
  {
    type: 'article',
    uid: '2',
    id: 'xx2',
    lang: 'fr'
  },
  {
    type: 'article',
    uid: '3',
    id: 'xx3',
    lang: 'en'
  }
]

const client = {
  getAll() {
    return _documents
  },
  getByLang(lang) {
    return _documents.filter(d => d.lang === lang)
  },
  getById(id) {
    return _documents.find(d => d.id === id)
  }
}

const saveToFs = (docs) => {
  const mapFromUidToTechId = {}
  docs.forEach(doc => {
    if (mapFromUidToTechId[`${doc.uid}:${doc.lang}`]) {
      throw new Error(`You have more than one document with uid ${doc.uid} and lang ${doc.lang} in Prismic. Please fix this.`)
    }
    mapFromUidToTechId[`${doc.uid}:${doc.lang}`] = doc.id
  })
  fs.writeFileSync(UidsFilePath, JSON.stringify(mapFromUidToTechId), 'utf-8')
}

const readFromFs = (key) => {
  const file = fs.readFileSync(UidsFilePath, 'utf-8')
  const mapFromUidToTechId = JSON.parse(file)
  return mapFromUidToTechId[key]
}


export default function page({ doc }) {
  return (
    <div style={{ padding: '24px' }}>
      <h3>doc type: {doc.type}</h3>
      <p>doc uid: {doc.uid}</p>
      <p>doc lang: {doc.lang}</p>
      <div style={{ marginTop: '2em'}}>
        Try with:
        <ul>
          <li>
            <a href="/fr/4">/fr/4</a>
          </li>
          <li>
            <a href="/fr/1">/fr/1</a>
          </li>
          <li>
            <a href="/en/3">/en/3</a>
          </li>
        </ul>
      </div>
    </div>
  )
}

export const getStaticProps = async (ctx) => {
  const technicalId = readFromFs(`${ctx.params.uid}:${ctx.params.lang}`)
  const doc = client.getById(technicalId)
  return {
    props: { doc }
  }
}

export const getStaticPaths = async () => {
  const prismicDocs = client.getAll()
  saveToFs(prismicDocs)
  return {
    paths: _documents.map(d => ({ params: d })),
    fallback: false
  }
}
