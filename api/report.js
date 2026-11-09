import {Document,Packer,Paragraph,TextRun,HeadingLevel} from 'docx';
import {gate} from '../lib/core.js';
export default async function handler(req,res){
 if(!gate(req,res))return;
 const {content,title='Relatório Abadon AI'}=req.body||{};
 if(typeof content!=='string'||!content.trim()||content.length>70000||typeof title!=='string'||title.length>200)return res.status(400).json({error:'Relatório inválido.'});
 const children=[new Paragraph({text:title,heading:HeadingLevel.TITLE}),...content.split('\n').map(line=>{const h=line.match(/^(#{1,3}) (.*)$/);return new Paragraph(h?{text:h[2],heading:[HeadingLevel.HEADING_1,HeadingLevel.HEADING_2,HeadingLevel.HEADING_3][h[1].length-1]}:{children:[new TextRun(line.replace(/\*\*/g,''))],spacing:{after:120}});})];
 const buffer=await Packer.toBuffer(new Document({creator:'Abadon AI',title,sections:[{children}]}));res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.wordprocessingml.document');res.setHeader('Content-Disposition','attachment; filename="relatorio-abadon.docx"');res.send(buffer);
}
