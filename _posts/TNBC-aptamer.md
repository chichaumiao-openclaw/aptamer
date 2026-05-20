---
layout: theophylline_style
title: TNBC aptamer
date: 2024-06-07 00:00:00
author: Zhizhong Lu, Ying Ao
categories: Aptamer
tags:
- Category:Cell
- GC:46.51
- GC:48.84
- GC:51.160000000000004
- GC:52.33
- GC:57.14
- Length:63
- Length:86
- Named:Triple-negative breast cancer (TNBC)_TN145
- Named:Triple-negative breast cancer (TNBC)_TN2
- Named:Triple-negative breast cancer (TNBC)_TN20
- Named:Triple-negative breast cancer (TNBC)_TN29
- Named:Triple-negative breast cancer (TNBC)_TN3
- Named:Triple-negative breast cancer (TNBC)_TN58
- Type:Cells
- Year:2020
type: Cells
permalink: /_posts/TNBC-aptamer.html
---
<html>



<div class="side-nav">
<ul>
    <div class="side-nav-item"><li><a href="#description" style="color: #000000;">Description</a></li></div>
    <div class="side-nav-item"><li><a href="#SELEX" style="color: #000000;">SELEX</a></li></div>
    <div class="side-nav-item"><li><a href="#Structure" style="color: #000000;">Structure</a></li></div>
    <div class="side-nav-item"><li><a href="#ligand-recognition" style="color: #000000;">Ligand information</a></li></div>
    <div class="side-nav-item"><li><a href="#references" style="color: #000000;">References</a></li></div>
    </ul>
</div>



<p class="header_box" id="description">Description</p>
<p>In 2020, Camorani, S. et al. identified a panel of nuclease-resistant RNA aptamers that bind to target cells by integrating a cell-SELEX method for the specific recognition of TNBC cells with high-throughput sequencing technology and their cisplatin- and doxorubicin-resistant derivatives,  and distinguish TNBC cells from both normal breast cells and non-TNBC breast cancer cells. Further, these aptamers interfere with the TNBC cells capacity of growing in vitro as mammospheres, a feature associated with the malignant phenotype, thus indicating they could be employed as important anti-tumor agents<sup>[<a href="#ref1" style="color:#520049">1</a>]</sup>.<br></p>


<p class="header_box" id="SELEX">SELEX</p>
<p>Started from a library of nuclease-resistant 2′fluoro-pyrimidines (2′F-Py) RNAs and performed a total of 14 consecutive rounds of positive selection on human MDA-MB-231 cells (ER−, PR−, HER2−), with increasing selection stringency. Choose to include into the selection cycle, starting from the fifth SELEX round, a second counterselection against EGFR-overexpressing epidermoid carcinoma A431 cells, to avoid that sequences against EGFR could dominate the selection. Ten selection rounds (0, 3, 5, 7, 9, 10, 11, 12, 13, and 14) were analyzed by Illumina NGS, and data were compared with those obtained by classical cloning of the last selected pool<sup>[<a href="#ref1" style="color:#520049">1</a>]</sup>.</p>



<p class="header_box" id="Structure">Structure</p>
<p class="blowheader_box">2D representation</p>
<p>The 2D structure of the figure is based on the prediction results of the RNA fold website by ribodraw tool to draw. We chose the minimum free energy (MFE) structure and used ribodraw tool to draw the figure.</p>
<p>5'-UAGGGAAGAGAAGGACAUAUGAUCCUGCCCCAACCAUCGCUUCCUCGACGCGCGUUGUCGGCAUUGACUAGUACAUGACCACUUGA-3'</p>
<img src="/images/2D/TNBC_aptamer_2D.svg" alt="drawing" style="width:800px;display:block;margin:0 auto;border-radius:0;" class="img-responsive">
<div style="display: flex; justify-content: center;"></div>
<br>



<font ><p class="header_box" id="ligand-recognition">Ligand information</p>  

<p class="blowheader_box">SELEX ligand</p>
<p>Triple-negative breast cancer (TNBC) is any breast cancer that either lacks or shows low levels of estrogen receptor (ER), progesterone receptor (PR) and human epidermal growth factor receptor 2 (HER2) overexpression and/or gene amplification (i.e. the tumor is negative on all three tests giving the name triple-negative). Triple-negative is sometimes used as a surrogate term for basal-like.-----From Wiki</p>
<table class="table table-bordered" style="table-layout:fixed;width:auto;margin-left:auto;margin-right:auto;" >
  <thead>
      <tr>
        <th onclick="sortTable(0)">Name</th>
        <th onclick="sortTable(1)">GenBase gene</th>
        <th onclick="sortTable(2)">GenBase protein</th>
        <th onclick="sortTable(3)">Gene ID</th>
      </tr>
  </thead>
    <tbody>
      <tr>
        <td name="td0">Triple-negative breast cancer (TNBC)</td>
        <td name="td1"><a href="https://ngdc.cncb.ac.cn/genbase/search/gb/LY573871.1" target="_blank" style="color:#520049"><b>LY573871.1</b></a></td>
        <td name="td2">NA</td>
        <td name="td3">NA</td>
      </tr>
	  </tbody>
  </table>

  <p>Some isolated sequences bind to the affinity of the protein.</p>
<table class="table table-bordered" style="table-layout:fixed;width:auto;margin-left:auto;margin-right:auto;" >
  <thead>
      <tr>
        <th onclick="sortTable(0)">Name</th>
        <th onclick="sortTable(1)">Sequence</th>
        <th onclick="sortTable(2)">Ligand</th>
        <th onclick="sortTable(3)">Affinity</th>
      </tr>
  </thead>
    <tbody>
      <tr>
      <td name="td0">TN2</td>
      <td name="td1">5'-UAGGGAAGAGAAGGACAUAUGAUAAGGCCGACGUAAUGUGUCGGUCGUUACGCGUCGUGCACGUUGACUAGUACAUGACCACUUGA-3'</td>
      <td name="td2">MDA-MB-231 cells</td>
      <td name="td3">59.12 ± 12.93 by streptavidin-biotin colorimetric assay and 73.02 ± 12 by flow cytometric assay</td>
    </tr>
            
     <tr>
      <td name="td0">TN3</td>
      <td name="td1">5'-UAGGGAAGAGAAGGACAUAUGAUCCGAUCUCACGCGCACCUUCUCUUCAGCGCGCGACUGGCAUUGACUAGUACAUGACCACUUGA-3'</td>
      <td name="td2">MDA-MB-231 cells</td>
      <td name="td3">21.91 ± 3.08 by streptavidin-biotin colorimetric assay and 28.93 ± 9.72 by flow cytometric assay</td>
    </tr>
            
     <tr>
      <td name="td0">TN20</td>
      <td name="td1">5'-UAGGGAAGAGAAGGACAUAUGAUCGAUGCGCACCGAUCUCUCUUCUGCACGUCCUUCGGCACAUUGACUAGUACAUGACCACUUGA-3'</td>
      <td name="td2">MDA-MB-231 cells</td>
      <td name="td3">24.30 ± 4.99 by streptavidin-biotin colorimetric assay and 23.92 ± 3.59 by flow cytometric assay</td>
    </tr>
            
     <tr>
      <td name="td0">TN29</td>
      <td name="td1">5'-UAGGGAAGAGAAGGACAUAUGAUCCUGCCCCAACCAUCGCUUCCUCGACGCGCGUUGUCGGCAUUGACUAGUACAUGACCACUUGA-3'</td>
      <td name="td2">MDA-MB-231 cells</td>
      <td name="td3">9.84 ± 1.63 by streptavidin-biotin colorimetric assay and 10.77 ± 2.41 by flow cytometric assay</td>
    </tr>
            
     <tr>
      <td name="td0">TN58</td>
      <td name="td1">5'-UAGGGAAGAGAAGGACAUAUGAUGCAACGUUGUGGUCCCGUUUGCACUUUGUUUACGCGCGCAUUGACUAGUACAUGACCACUUGA-3'</td>
      <td name="td2">MDA-MB-231 cells</td>
      <td name="td3">17.17 ± 2.87 by streptavidin-biotin colorimetric assay and 26.09 ± 3.20 by flow cytometric assay</td>
    </tr>
            
     <tr>
      <td name="td0">TN145</td>
      <td name="td1">5'-UAGGGAAGAGAAGGACAUAUGAUCCUCAGCGCGCAACUUCCCUCCGUUCCCUGCCACGCGUCA-3'</td>
      <td name="td2">MDA-MB-231 cells</td>
      <td name="td3">26.88 ± 3.68 streptavidin-biotin colorimetric assay and 37.36 ± 3.50 by flow cytometric assay</td>
    </tr>
	  </tbody>
  </table>


                 
<p class="header_box" id="references">References</p>
                
<a id="ref1"></a><font><strong>[1] Novel Aptamers Selected on Living Cells for Specific Recognition of Triple-Negative Breast Cancer.</strong></font><br />
Camorani, S., Granata, I., Collina, F., Leonetti, F., Cantile, M., Botti, G., Fedele, M., Guarracino, M. R., & Cerchia, L.<br />
<a href="https://pubmed.ncbi.nlm.nih.gov/32222697/" target="_blank" style="color:#520049">iScience, 23(4), 100979. (2020)</a>
<br/>




<html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <!-- Molstar CSS & JS -->
      <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/pdbe-molstar@3.3.0/build/pdbe-molstar.css">
      <script src="https://cdn.jsdelivr.net/npm/pdbe-molstar@3.3.0/build/pdbe-molstar-plugin.js"></script>
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
    <script>
      var viewerInstance1 = new PDBeMolstarPlugin();
      var options1 = {
        customData:{
        format: 'pdb'},
        hideCanvasControls: ['expand', 'selection', 'animation', 'controlToggle'],
        bgColor: {r:255, g:255, b:255},
        }
      var viewerContainer1 = document.getElementById('myViewer1');
      viewerInstance1.render(viewerContainer1, options1);
  window.addEventListener('load', function() {
    var colorSelectionButton1 = document.querySelector('.controlsSection1 button');
    colorSelectionButton1.click();
  });
    </script>


</html>
