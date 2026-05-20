---
title: "Ribocentre Aptamer - Applications"
layout: piclay
excerpt: "Ribocentre-aptamer: A aptamer database"
sitemap: True
permalink: /applications/
---
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script src="/js/applications.js"></script>
<style>
:root {
  --primary-color: #520049;
  --secondary-color: #f5f5f5;
  --text-color: #333;
  --border-radius: 8px;
  --transition: all 0.3s ease;
  --box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.7;
  color: var(--text-color);
  font-size: 16px;
  letter-spacing: 0.3px;
  padding-top: 0px;
}
p {
  margin-bottom: 18px;
  text-align: justify;
  text-justify: inter-word;
  }
  /* 统一首字母放大加粗 */
.content-section p::first-letter,
.post-content    p::first-letter,
.fluor-body-section p::first-letter{
  font-weight:700;
  font-size:1.2em;
  color:var(--primary-color);
}
.purple-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
.purple-list li {
  background-color: #fafafa;
  color: var(--text-color);
  background-clip: text;
  -webkit-background-clip: text; /* 兼容 WebKit */
  animation: moveGradient 8s ease infinite;
  background-image: linear-gradient(270deg, #520049, #772c78, #c050d0, #772c78, #520049);
  background-size: 400% 400%;
  margin-bottom: 12px;
  border-radius: 4px;
  padding: 12px 15px 12px 18px;
  position: relative;
  border-left: 6px solid var(--primary-color);
  box-shadow: var(--box-shadow);
}
.purple-list li::before {
  content: "";
  display: none; /* 用左侧彩色边替代原有色块 */
}
.purple-list li b {
  background-image: linear-gradient(270deg, #520049, #772c78, #c050d0, #772c78, #520049);
  background-size: 400% 400%;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  animation: moveGradient 8s ease infinite;
}
.purple-list li p {
  color: #333;
  margin-top: 5px;
}
.button-container {
  display: flex;
  justify-content: left;
  align-items: center;
  height: 50px;
}
.button {
  display: block;
  padding: 10px;
  font-size: 24px;
  margin-right: 10px;
  text-align: center;
  background-color: #efefef;
  color: #005826;
  text-decoration: none;
  border: 1px solid #005826;
  border-radius: 5px;
}
.button:hover {
  background-color: #999;
  cursor: pointer;
}
.section-title {
  color: var(--primary-color);
  font-size: 24px;
  margin: 30px 0 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--primary-color);
}

/* 一级标题样式 */
.post-title {
  color: var(--primary-color);
  font-size: 32px;
  margin: 40px 0 25px;
  padding-bottom: 12px;
  border-bottom: 3px solid var(--primary-color);
  font-weight: 700;
}
.blowheader_box {
  background: linear-gradient(135deg, var(--primary-color), rgba(82,0,73,0.8));
  color: white;
  padding: 12px 20px;
  margin: 20px 0 15px;
  border-radius: var(--border-radius);
  font-size: 18px;
  font-weight: 600;
  position: relative;
  box-shadow: 0 4px 15px rgba(82,0,73,0.2);
}
.blowheader_box::before {
  margin-right: 10px;
  font-size: 0.9em;
}
table.dataTable.no-footer {
  border-bottom: 1px solid rgba(0,0,0,0);
}
div.content-section h2[id="references"] + a[id^="ref"],
div.content-section a[id^="ref"] + a[id^="ref"] {
  display: block;
  margin-top: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(82,0,73,0.1);
}
div.content-section a[id^="ref"]:nth-of-type(odd) {
  background-color: rgba(245,245,245,0.5);
  padding: 10px;
  border-radius: var(--border-radius);
}
div.content-section a[id^="ref"] {
  display: block !important;
  margin-top: 15px !important;
}

/* ===== 表格边框覆盖，去除黑色细线 ===== */
.table,
table,
.table-bordered,
table.dataTable,
.table2 {
  border: none !important;
}

/* ===== Purple list dynamic gradient ===== */
@keyframes moveGradient {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.purple-list li {
  background-color: #fafafa;
  color: var(--text-color);
  background-clip: text;
  -webkit-background-clip: text; /* 兼容 WebKit */
  animation: moveGradient 8s ease infinite;
  background-image: linear-gradient(270deg, #520049, #772c78, #c050d0, #772c78, #520049);
  background-size: 400% 400%;
  margin-bottom: 12px;
  border-radius: 4px;
  padding: 12px 15px 12px 18px;
  position: relative;
  border-left: 6px solid var(--primary-color);
  box-shadow: var(--box-shadow);
}
.purple-list li b {
  background-image: linear-gradient(270deg, #520049, #772c78, #c050d0, #772c78, #520049);
  background-size: 400% 400%;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  animation: moveGradient 8s ease infinite;
}
</style>
<link rel="stylesheet" type="text/css" href="https://www.ebi.ac.uk/pdbe/pdb-component-library/css/pdbe-molstar-1.2.1.css">
<script src="/js/mol/pdbe-molstar-plugin.js"></script>
<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  .msp-plugin ::-webkit-scrollbar-thumb {
    background-color: #474748  !important;
  }
  .msp-plugin .msp-layout-standard {
    border: 1px solid #efefef;
  }
  .viewerSection1 {
    padding-top: 0px;
  }
  .controlsSection1 {
    width: 300px;
    display: flex;
    float:left;
    padding: 0px 0 0 0;
    height:25px;
  }
  .controlBox1 {
    border: 0px solid lightgray;
    padding: 0px;
    margin-bottom: 0px;
  }
  #myViewer1{
    float:left;
    width:500px;
    height: 500px;
    position:relative;
  }
</style>
</head>
<body>
<div class="content-section">
<h1 class="post-title" itemprop="name headline">Applications</h1>
<p>RNA aptamers are short, single-stranded RNA molecules that have the ability to fold into specific three-dimensional shapes, enabling them to bind to a wide range of target molecules with high affinity and specificity. The discovery of RNA aptamers can be traced back to the early 1990s when researchers began to explore the potential of RNA molecules to form complex structures and interact with various ligands. Derived from the in vitro selection process known as SELEX (Systematic Evolution of Ligands by Exponential Enrichment), RNA aptamers exhibit high affinity and specificity for a wide range of targets, including proteins, peptides, small molecules, and even entire cells. In the rapidly evolving landscape of modern biomedical research, RNA aptamers have emerged as a promising class of biomolecules with immense potential for diagnostic and therapeutic applications.  The unique properties of RNA aptamers have enabled their application in a diverse range of fields, including therapeutics, diagnostics, molecular imaging, targeted drug delivery, environmental monitoring, research, and synthetic biology<sup>[<a href="#ref1" style="color:#520049">1</a></sup><sup>,<a href="#ref2" style="color:#520049">2</a></sup><sup>]</sup>.</p>
<div style="display: flex; justify-content: center;"></div>
<img src="/images/applications/main.png" alt="drawing" style="width:900px;display:block;margin:0 auto;border-radius:0;" class="img-responsive">
<br>
<p>RNA aptamers offer several advantages over traditional antibodies and other molecular recognition elements<sup>[<a href="#ref3" style="color:#520049">3</a></sup><sup>]</sup>:</p>

<ul class="purple-list">
    <li><b>Versatility</b> &nbsp;&nbsp;&nbsp; Aptamers can be engineered to target a wide range of molecules, including proteins, small molecules, ions, and even whole cells.</li>
    <li><b>High Affinity and Specificity</b> &nbsp;&nbsp;&nbsp; They can exhibit binding affinities and specificities comparable to monoclonal antibodies.</li>
    <li><b>Stability</b> &nbsp;&nbsp;&nbsp; RNA aptamers can be chemically modified to enhance their stability, allowing them to resist degradation and maintain their function in various biological environments.</li>
    <li><b>Renewability</b> &nbsp;&nbsp;&nbsp; Unlike antibodies, which are produced by living organisms and can be challenging to produce in large quantities, aptamers can be synthesized in vitro in large quantities and with high purity.</li>
    <li><b>Low Immunogenicity</b> &nbsp;&nbsp;&nbsp; They generally elicit a lower immune response compared to antibodies, which is advantageous for in vivo applications.</li>
    <li><b>Ease of Modification</b> &nbsp;&nbsp;&nbsp; RNA aptamers can be chemically modified to improve their properties, such as stability, solubility, and resistance to nucleases.</li>
    <li><b>Multivalency</b> &nbsp;&nbsp;&nbsp; They can be designed to bind multiple targets or to carry multiple functionalities, such as drug delivery or imaging agents.</li>
</ul>
</div>


<div class="content-section">
<h2 class="section-title" id="Diagnosis-detection" style="margin-top: 0px;">Diagnosis and detection</h2>
<p>In the diagnostic arena, RNA aptamers have been employed as molecular probes for the detection of various biomarkers. Their high affinity and specificity for target molecules allow for the development of sensitive and selective assays. For example, aptamers have been used to detect cancer biomarkers in blood samples, enabling early diagnosis and treatment of malignancies. Additionally, aptamers have been utilized in the development of biosensors for the detection of pathogens, toxins, and other harmful substances, providing a rapid and reliable means of monitoring environmental and food safety. In addition, they can detect and image various biomolecules or cellular processes, enhancing the sensitivity and specificity of diagnostic assays<sup>[<a href="#ref6" style="color:#520049">6</a></sup><sup>,<a href="#ref7" style="color:#520049">7</a></sup><sup>]</sup>.</p>
<div class="blowheader_box">Diagnosis of infectious diseases and pathogens</div>      
<p>In the evolving field of diagnostics for infectious diseases, RNA aptamers have emerged as a powerful tool for the detection of parasites, bacteria, prion protein, and viruses. In the context of viral detection, RNA aptamers have been developed to target conserved regions of viral genomes. These aptamers can be used in diagnostic assays such as reverse transcription-polymerase chain reaction (RT-PCR) or isothermal amplification techniques, enhancing the sensitivity and specificity of viral detection. The ability to rapidly detect viral infections, especially those caused by emerging or re-emerging viruses, is crucial for effective disease control and management. Another important application is in infectious disease diagnostics. RNA aptamers can be designed to recognize viral proteins, enabling the rapid and precise detection of viral pathogens such as HIV, hepatitis C virus (HCV), and influenza. These aptamer-based diagnostic tools can be particularly valuable in resource-limited settings where quick and accurate detection is crucial for disease management and control<sup>[<a href="#ref4" style="color:#520049">4</a></sup><sup>,<a href="#ref5" style="color:#520049">5</a></sup><sup>]</sup>.</p>
<p>The following table will give some examples of RNA aptamers cases.</p>
<div style="display: flex; justify-content: center;"></div>
<img src="/images/applications/ͼ1.svg" alt="drawing" style="width:500px;height:500px;display:block;margin:0 auto;border-radius:0;" class="img-responsive">

<div id="section1-table">
    <!-- 表格将通过JavaScript动态加载 -->
</div>
<br>


<div class="blowheader_box">Cancer Recognition and Molecular Imaging</div>      
<p>In the diagnostic arena, RNA aptamers have been employed as molecular probes for the detection of various biomarkers. Their high affinity and specificity for target molecules allow for the development of sensitive and selective assays. For example, aptamers have been used to detect cancer biomarkers in blood samples, enabling early diagnosis and treatment of malignancies. RNA aptamers can be conjugated with imaging agents, making them valuable tools in molecular imaging for disease diagnosis and monitoring. For instance, RNA aptamers specific to cancer biomarkers can be labeled with fluorescent dyes or radioactive isotopes and used to visualize tumors in vivo. This application has significant implications for early cancer detection, allowing for non-invasive imaging of tumor cells and monitoring of treatment efficacy<sup>[<a href="#ref7" style="color:#520049">7</a></sup><sup>,<a href="#ref8" style="color:#520049">8</a></sup><sup>,<a href="#ref10" style="color:#520049">10</a></sup><sup>]</sup>.</p>
<p>The following table will give some examples of RNA aptamers cases. The picture is from an article written by M Ryan Corces about cancer markers<sup>[<a href="#ref9" style="color:#520049">9</a></sup><sup>]</sup>.</p>
<div style="display: flex; justify-content: center;"></div>
<img src="/images/applications/ͼ2.svg" alt="drawing" style="width:500px;height:500px;display:block;margin:0 auto;border-radius:0;" class="img-responsive">

<div id="section2-table">
    <!-- 表格将通过JavaScript动态加载 -->
</div>
<br>


<div class="blowheader_box">Clinical sample detection</div>      
<p>With the rapid development of biotechnology and medicine, RNA aptamer, as a new recognition element, has shown great potential and application prospect in the field of clinical sample detection. As an RNA molecule with high affinity and specific binding to specific targets, RNA aptamers play an important role in the detection and diagnosis of biomarkers in serum, biomarkers in urine, feces, prostatic fluid and other clinical samples.<sup>[<a href="#ref12" style="color:#520049">12</a></sup><sup>,<a href="#ref13" style="color:#520049">13</a></sup><sup>]</sup>.</p>
<p>The following table will give some examples of RNA aptamers cases.</p>
<div style="display: flex; justify-content: center;"></div>
<img src="/images/applications/ͼ3.png" alt="drawing" style="width:1000px;display:block;margin:0 auto;border-radius:0;" class="img-responsive">

<div id="section3-table">
    <!-- 表格将通过JavaScript动态加载 -->
</div>

        
</div>
<div class="content-section">
<h2 class="section-title" id="Disease-treatment-drugs">Disease treatment and drugs</h2>
<div class="blowheader_box">Aptamers as inhibitor</div>      
<p>RNA aptamers can be used as therapeutic agents to modulate the activity of proteins or other targets involved in disease pathways. RNA aptamers have shown great promise as therapeutic agents, primarily due to their high specificity and low immunogenicity compared to antibodies. The therapeutic potential of RNA aptamers is particularly promising. Their ability to bind tightly and specifically to target proteins has enabled the development of aptamer-based therapeutics that can inhibit the function of disease-causing proteins. Aptamers have been used to target a wide range of proteins, including growth factors, receptors, enzymes, and transcription factors, with the potential to treat a variety of diseases, including cancer, inflammatory disorders, and infectious diseases. Furthermore, aptamers can be conjugated to therapeutic payloads, such as cytotoxic drugs or radioactive isotopes, enabling targeted delivery of therapeutics to diseased cells while minimizing systemic toxicity<sup>[<a href="#ref7" style="color:#520049">7</a></sup><sup>,<a href="#ref13" style="color:#520049">13</a></sup><sup>,<a href="#ref14" style="color:#520049">14</a></sup><sup>,<a href="#ref15" style="color:#520049">15</a></sup><sup>]</sup>.</p>
<p>The following table will give some examples of RNA aptamers cases.</p>
<div style="display: flex; justify-content: center;"></div>
<img src="/images/applications/ͼ4.svg" alt="drawing" style="height:500px;display:block;margin:0 auto;border-radius:0;" class="img-responsive">
<div id="section4-table">
    <!-- 表格将通过JavaScript动态加载 -->
</div>
<br>

<div class="blowheader_box">Targeted drug delivery</div>      
<p>The another innovative applications of RNA aptamers is in targeted drug delivery. By conjugating aptamers to therapeutic agents, it is possible to direct these agents specifically to disease sites, minimizing off-target effects and enhancing therapeutic efficacy.  Targeted drug delivery is a smart way to give medicine to the body. Instead of spreading the medicine everywhere, which can cause side effects, we want to give the medicine only to the place where it's needed. So, imagine we have a medicine that can help fight a disease, but we don't want it to go everywhere in the body. We can attach this medicine to an RNA aptamer. The RNA aptamer is like a guide, it knows exactly where to go because it can find and stick to its specific target. When the RNA aptamer finds its target, it delivers the medicine right there. This way, we can treat the disease more effectively and with fewer side effects. It's like sending a package directly to the right address instead of leaving it at the post office for someone to pick up. For example, aptamers that bind to cancer cell surface markers can be linked to chemotherapeutic drugs, ensuring that the drugs are delivered directly to the cancer cells while sparing healthy tissues. In targeted drug delivery, these RNA aptamers are used to deliver drugs directly to the affected cells or tissues. By attaching a drug to an RNA aptamer, the medication can be directed precisely where it is needed, reducing side effects and increasing effectiveness. This approach is particularly useful for treating diseases like cancer, where it's important to target only the cancerous cells while leaving healthy cells unharmed<sup>[<a href="#ref16" style="color:#520049">16</a></sup><sup>,<a href="#ref17" style="color:#520049">17</a></sup><sup>,<a href="#ref18" style="color:#520049">18</a></sup><sup>]</sup>.</p>
<p>The following table will give some examples of RNA aptamers cases.</p>
<div style="display: flex; justify-content: center;"></div>
<img src="/images/applications/ͼ5.png" alt="drawing" style="width:1000px;display:block;margin:0 auto;border-radius:0;" class="img-responsive">
<div id="section5-table">
    <!-- 表格将通过JavaScript动态加载 -->
</div>



</div>
<div class="content-section">
<h2 class="section-title" id="Biosensing-monitoring">Biosensing and monitoring</h2>
<p>RNA aptamers have also found applications in the field of biosensing. Their high affinity and specificity for target molecules allow for the development of sensors with enhanced sensitivity and selectivity. Aptamer-based biosensors have been used for the detection of biomarkers, pathogens, and toxins, with the potential for rapid, real-time monitoring of biological samples. Additionally, aptamers can be integrated into biosensing platforms, such as microfluidic devices and nanoparticle-based sensors, enabling the development of miniaturized, portable, and user-friendly diagnostic tools. RNA aptamers are also finding applications in environmental monitoring, where they are used to detect pollutants and toxins with high sensitivity and specificity. For instance, aptamers that bind to heavy metals such as lead and mercury can be incorporated into sensors to monitor water quality. These aptamer-based sensors offer a rapid and reliable method for detecting environmental contaminants, which is crucial for ensuring public health and safety. In addition, RNA aptamers have been developed to detect biotoxins and pathogens in food and water samples. aptamers can be used in biosensors to detect these contaminants in food products, helping to prevent foodborne illnesses<sup>[<a href="#ref19" style="color:#520049">19</a></sup><sup>,<a href="#ref20" style="color:#520049">20</a></sup><sup>]</sup>.</p>
<p>The following table will give some examples of RNA aptamers cases. The picture is from a review written by Harmanjit Kaur<sup>[<a href="#ref21" style="color:#520049">21</a></sup><sup>]</sup>.</p>
<div style="display: flex; justify-content: center;"></div>
<img src="/images/applications/ͼ6.png" alt="drawing" style="width:1000px;height:550px;display:block;margin:0 auto;border-radius:0;" class="img-responsive">
<div id="section6-table">
    <!-- 表格将通过JavaScript动态加载 -->
</div>


</div>
<div class="content-section">
<h2 class="section-title" id="Research-Tools">Research Tools</h2>
<p>In the realm of basic research, RNA aptamers serve as valuable tools for studying molecular interactions and cellular processes. They can be used as molecular probes to study protein function, investigate signaling pathways, and dissect complex biological systems. RNA aptamers can also be employed to inhibit specific proteins or pathways in a controlled manner, providing insights into their roles in cellular physiology and disease. In the laboratory, aptamers are valuable for studying protein functions, signaling pathways, and molecular interactions due to their ability to bind targets with high specificity<sup>[<a href="#ref23" style="color:#520049">23</a></sup><sup>,<a href="#ref24" style="color:#520049">24</a></sup><sup>]</sup>. Among them, fluorescent RNA aptamers is the most important research tools. For more fluorescent RNA aptamers, please refer to <a href="/fluorescences" target="_blank" style="color:#520049"><b><i>Fluorescences</i></b></a> page.</p>
<p>For example, the aptamers can be combined with a variety of different expression platforms. RNA-based switches have been constructed that allow for controlling gene expression in diverse contexts. Recently, researchers have developed a gene expression control technique that utilizes a tetracycline-dependent ribozyme switch to achieve conditional induction of gene expression in Caenorhabditis elegans.  This system provides a powerful tool for studying gene regulation in C. elegans, as it allows for precise control of gene expression in living organisms<sup>[<a href="#ref22" style="color:#520049">22</a></sup><sup>]</sup>.</p>
<p>The picture is from a review written by Maike Spöring<sup>[<a href="#ref24" style="color:#520049">24</a></sup><sup>]</sup>.</p>
<div style="display: flex; justify-content: center;"></div>
<img src="/images/applications/ͼ7.png" alt="drawing" style="width:1000px;display:block;margin:0 auto;border-radius:0;" class="img-responsive">
<div id="section7-table">
    <!-- 表格将通过JavaScript动态加载 -->
</div>



</div>
<div class="content-section">
<h2 class="section-title" id="references">References</h2>
                
<a id="ref1"></a><font><strong>[1] In vitro selection of RNA molecules that bind specific ligands.</strong></font><br />
Ellington, A. D., & Szostak, J. W.<br />
<a href="https://pubmed.ncbi.nlm.nih.gov/1697402/" target="_blank" style="color:#520049">Nature, 346(6287), 818–822. (1990)</a>
<br/>
            
<a id="ref2"></a><font><strong>[2] Systematic evolution of ligands by exponential enrichment: RNA ligands to bacteriophage T4 DNA polymerase.</strong></font><br />
Tuerk, C., & Gold, L.<br />
<a href="https://pubmed.ncbi.nlm.nih.gov/2200121/" target="_blank" style="color:#520049">Science (New York, N.Y.), 249(4968), 505–510. (1990)</a>
<br/>
            
<a id="ref3"></a><font><strong>[3] Aptamers as targeted therapeutics: current potential and challenges.</strong></font><br />
Zhou, J., & Rossi, J.<br />
<a href="https://pubmed.ncbi.nlm.nih.gov/27807347/" target="_blank" style="color:#520049">Nature reviews. Drug discovery, 16(3), 181–202. (2017)</a>
<br/>
            
<a id="ref4"></a><font><strong>[4] Oligonucleotide aptamers for pathogen detection and infectious disease control.</strong></font><br />
Wan, Q., Liu, X., & Zu, Y.<br />
<a href="https://pubmed.ncbi.nlm.nih.gov/34522231/" target="_blank" style="color:#520049">Theranostics, 11(18), 9133–9161. (2021)</a>
<br/>
            
<a id="ref5"></a><font><strong>[5] Aptamers in diagnostics and treatment of viral infections.</strong></font><br />
Wandtke, T., Woźniak, J., & Kopiński, P.<br />
<a href="https://pubmed.ncbi.nlm.nih.gov/25690797/" target="_blank" style="color:#520049">Viruses, 7(2), 751–780. (2015)</a>
<br/>
            
<a id="ref6"></a><font><strong>[6] Translation of aptamers toward clinical diagnosis and commercialization.</strong></font><br />
Liu, S., Xu, Y., Jiang, X., Tan, H., & Ying, B.<br />
<a href="https://pubmed.ncbi.nlm.nih.gov/35364525/" target="_blank" style="color:#520049">Biosensors & bioelectronics, 208, 114168. (2022)</a>
<br/>
            
<a id="ref7"></a><font><strong>[7] Aptamers in the Therapeutics and Diagnostics Pipelines.</strong></font><br />
Kaur, H., Bruno, J. G., Kumar, A., & Sharma, T. K.<br />
<a href="https://pubmed.ncbi.nlm.nih.gov/30128033/" target="_blank" style="color:#520049">Theranostics, 8(15), 4016–4032. (2018)</a>
<br/>
            
<a id="ref8"></a><font><strong>[8] Aptamers used for molecular imaging and theranostics - recent developments.</strong></font><br />
Bohrmann, L., Burghardt, T., Haynes, C., Saatchi, K., & Häfeli, U. O.<br />
<a href="https://pubmed.ncbi.nlm.nih.gov/35673581/" target="_blank" style="color:#520049">Theranostics, 12(9), 4010–4050. (2022)</a>
<br/>
            
<a id="ref9"></a><font><strong>[9] The chromatin accessibility landscape of primary human cancers.</strong></font><br />
Corces, M. R., Granja, J. M., Shams, S., Louie, B. H., Seoane, J. A., Zhou, W., Silva, T. C., Groeneveld, C., Wong, C. K., Cho, S. W., Satpathy, A. T., Mumbach, M. R., Hoadley, K. A., Robertson, A. G., Sheffield, N. C., Felau, I., Castro, M. A. A., Berman, B. P., Staudt, L. M., Zenklusen, J. C., … Chang, H. Y.<br />
<a href="https://pubmed.ncbi.nlm.nih.gov/30361341/" target="_blank" style="color:#520049">Science (New York, N.Y.), 362(6413), eaav1898. (2018)</a>
<br/>
            
<a id="ref10"></a><font><strong>[10] Engineered aptamers for molecular imaging.</strong></font><br />
Lin, B., Xiao, F., Jiang, J., Zhao, Z., & Zhou, X.<br />
<a href="https://pubmed.ncbi.nlm.nih.gov/38098720/" target="_blank" style="color:#520049">Chemical science, 14(48), 14039–14061. (2023)</a>
<br/>
            
<a id="ref11"></a><font><strong>[11] Aptamers: active targeting ligands for cancer diagnosis and therapy.</strong></font><br />
Wu, X., Chen, J., Wu, M., & Zhao, J. X.<br />
<a href="https://pubmed.ncbi.nlm.nih.gov/25699094/" target="_blank" style="color:#520049">Theranostics, 5(4), 322–344. (2015)</a>
<br/>
            
<a id="ref12"></a><font><strong>[12] Highly-efficient selection of aptamers for detecting various HPV subtypes in clinical samples.</strong></font><br />
Yang, G., Li, W., Zhang, S., Hu, B., & Huang, Z.<br />
<a href="https://pubmed.ncbi.nlm.nih.gov/37604070/" target="_blank" style="color:#520049">Talanta, 266(Pt 2), 125039. (2024)</a>
<br/>
            
<a id="ref13"></a><font><strong>[13] Advances in Aptamers-Based Applications in Breast Cancer: Drug Delivery, Therapeutics, and Diagnostics.</strong></font><br />
Gholikhani, T., Kumar, S., Valizadeh, H., Mahdinloo, S., Adibkia, K., Zakeri-Milani, P., Barzegar-Jalali, M., & Jimenez, B.<br />
<a href="https://pubmed.ncbi.nlm.nih.gov/36430951/" target="_blank" style="color:#520049">International journal of molecular sciences, 23(22), 14475. (2022)</a>
<br/>
            
<a id="ref14"></a><font><strong>[14] Aptamers as Therapeutics.</strong></font><br />
Nimjee, S. M., White, R. R., Becker, R. C., & Sullenger, B. A.<br />
<a href="https://pubmed.ncbi.nlm.nih.gov/28061688/" target="_blank" style="color:#520049">Annual review of pharmacology and toxicology, 57, 61–79. (2017)</a>
<br/>
            
<a id="ref15"></a><font><strong>[15] Aptamers as targeted therapeutics: current potential and challenges.</strong></font><br />
Zhou, J., & Rossi, J.<br />
<a href="https://pubmed.ncbi.nlm.nih.gov/27807347/" target="_blank" style="color:#520049">Nature reviews. Drug discovery, 16(3), 181–202. (2017)</a>
<br/>
            
<a id="ref16"></a><font><strong>[16] Advances in Aptamers-Based Applications in Breast Cancer: Drug Delivery, Therapeutics, and Diagnostics.</strong></font><br />
Gholikhani, T., Kumar, S., Valizadeh, H., Mahdinloo, S., Adibkia, K., Zakeri-Milani, P., Barzegar-Jalali, M., & Jimenez, B.<br />
<a href="https://pubmed.ncbi.nlm.nih.gov/36430951/" target="_blank" style="color:#520049">International journal of molecular sciences, 23(22), 14475. (2022)</a>
<br/>
            
<a id="ref17"></a><font><strong>[17] Molecular aptamers for drug delivery.</strong></font><br />
Tan, W., Wang, H., Chen, Y., Zhang, X., Zhu, H., Yang, C., Yang, R., & Liu, C.<br />
<a href="https://pubmed.ncbi.nlm.nih.gov/21821299/" target="_blank" style="color:#520049">Trends in biotechnology, 29(12), 634–640. (2011)</a>
<br/>
            
<a id="ref18"></a><font><strong>[18] Method for Confirming Cytoplasmic Delivery of RNA Aptamers.</strong></font><br />
Dickey, D. D., Thomas, G. S., Dassie, J. P., & Giangrande, P. H.<br />
<a href="https://pubmed.ncbi.nlm.nih.gov/26472453/" target="_blank" style="color:#520049">Methods in molecular biology (Clifton, N.J.), 1364, 209–217. (2016)</a>
<br/>
            
<a id="ref19"></a><font><strong>[19] Genetically encoded RNA-based sensors with Pepper fluorogenic aptamer.</strong></font><br />
Chen, Z., Chen, W., Reheman, Z., Jiang, H., Wu, J., & Li, X.<br />
<a href="https://pubmed.ncbi.nlm.nih.gov/37486780/" target="_blank" style="color:#520049">Nucleic acids research, 51(16), 8322–8336. (2023)</a>
<br/>
            
<a id="ref20"></a><font><strong>[20] Aptasensors for pesticide detection.</strong></font><br />
Liu, M., Khan, A., Wang, Z., Liu, Y., Yang, G., Deng, Y., & He, N. <br />
<a href="https://pubmed.ncbi.nlm.nih.gov/30738246/" target="_blank" style="color:#520049">Biosensors & bioelectronics, 130, 174–184. (2019)</a>
<br/>
            
<a id="ref21"></a><font><strong>[21] Nanomaterial based aptasensors for clinical and environmental diagnostic applications.</strong></font><br />
Kaur, H., & Shorie, M.<br />
<a href="https://pubmed.ncbi.nlm.nih.gov/36131986/" target="_blank" style="color:#520049">Nanoscale advances, 1(6), 2123–2138. (2019)</a>
<br/>
            
<a id="ref22"></a><font><strong>[22] A tetracycline-dependent ribozyme switch allows conditional induction of gene expression in Caenorhabditis elegans.</strong></font><br />
Wurmthaler, L. A., Sack, M., Gense, K., Hartig, J. S., & Gamerdinger, M. <br />
<a href="https://pubmed.ncbi.nlm.nih.gov/30700719/" target="_blank" style="color:#520049">Nature communications, 10(1), 491. (2019)</a>
<br/>
            
<a id="ref23"></a><font><strong>[23] Ligand-dependent ribozymes.</strong></font><br />
Felletti, M., & Hartig, J. S.<br />
<a href="https://pubmed.ncbi.nlm.nih.gov/27687155/" target="_blank" style="color:#520049">Wiley interdisciplinary reviews. RNA, 8(2), 10.1002/wrna.1395. (2017)</a>
<br/>
            
<a id="ref24"></a><font><strong>[24] Aptamers in RNA-based switches of gene expression.</strong></font><br />
Spöring, M., Finke, M., & Hartig, J. S.<br />
<a href="https://pubmed.ncbi.nlm.nih.gov/31811992/" target="_blank" style="color:#520049">Current opinion in biotechnology, 63, 34–40. (2020)</a>
<br/>
