import glob
import os
import markdown
from fpdf import FPDF
from bs4 import BeautifulSoup
import re

class PDF(FPDF):
    def header(self):
        self.set_font('helvetica', 'B', 12)
        self.cell(0, 10, 'CreditGuard AI - Documentacao Academica', border=False, align='C')
        self.ln(20)
        
    def footer(self):
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.cell(0, 10, f'Pagina {self.page_no()}', 0, 0, 'C')

def md_to_pdf(md_file):
    with open(md_file, 'r', encoding='utf-8') as f:
        text = f.read()
        
    # Replace common unicode chars that Helvetica can't render
    text = text.replace('—', '-')
    text = text.replace('”', '"').replace('“', '"')
    text = text.replace('’', "'").replace('‘', "'")
    text = text.replace('–', '-')
    
    html = markdown.markdown(text, extensions=['tables'])
    soup = BeautifulSoup(html, 'html.parser')
    
    pdf = PDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.set_font("helvetica", size=11)
    
    def safe_text(txt):
        return txt.encode('latin-1', 'ignore').decode('latin-1')
    
    def safe_multi_cell(pdf, h, txt):
        try:
            pdf.multi_cell(0, h, txt)
        except Exception:
            # If it fails, force spaces every 80 chars
            spaced_txt = ' '.join(txt[i:i+80] for i in range(0, len(txt), 80))
            try:
                pdf.multi_cell(0, h, spaced_txt)
            except:
                pass

    # Very basic HTML to PDF rendering
    for element in soup.find_all(['h1', 'h2', 'h3', 'p', 'li', 'tr']):
        if element.name == 'h1':
            pdf.set_font("helvetica", 'B', 16)
            safe_multi_cell(pdf, 10, safe_text(element.text))
            pdf.ln(5)
        elif element.name == 'h2':
            pdf.set_font("helvetica", 'B', 14)
            safe_multi_cell(pdf, 8, safe_text(element.text))
            pdf.ln(4)
        elif element.name == 'h3':
            pdf.set_font("helvetica", 'B', 12)
            safe_multi_cell(pdf, 6, safe_text(element.text))
            pdf.ln(3)
        elif element.name == 'p':
            pdf.set_font("helvetica", '', 11)
            safe_multi_cell(pdf, 6, safe_text(element.text))
            pdf.ln(4)
        elif element.name == 'li':
            pdf.set_font("helvetica", '', 11)
            safe_multi_cell(pdf, 6, safe_text(f"- {element.text}"))
        elif element.name == 'tr':
            pdf.set_font("helvetica", '', 10)
            row_text = " - ".join([td.text.strip() for td in element.find_all(['td', 'th']) if td.text.strip()])
            if row_text:
                row_text = row_text.replace('-', ' - ')
                safe_multi_cell(pdf, 6, safe_text(row_text))
            
    out_name = md_file.replace('.md', '.pdf')
    # Use latin-1 compatible characters
    try:
        pdf.output(out_name)
    except Exception as e:
        print(f"Error saving {out_name}: {e}")

if __name__ == "__main__":
    for f in glob.glob("*.md"):
        print(f"Converting {f}...")
        md_to_pdf(f)
