---
title: "Ribocentre Aptamer - Help"
layout: theophylline_style
excerpt: "Riboaptamer: A riboaptamer database"
sitemap: True
permalink: /helps/
hide_sequence_btn: true
hide_nav_ball: true
body_attrs: "onload=\"showSheet('sheet1')\""
---
<!--set sort order in table header begin-->
<meta http-equiv="Content-type" content="text/html; charset=utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
  <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.12.1/css/jquery.dataTables.min.css">
  <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/buttons/2.2.3/css/buttons.dataTables.min.css">

  <script type="text/javascript" src="https://code.jquery.com/jquery-3.5.1.js"></script>
  <script type="text/javascript" src="https://cdn.datatables.net/1.12.1/js/jquery.dataTables.min.js"></script>
  <!--set sort order in table header finish-->

<meta name="google-site-verification" content="uLZVKfay17Zcx_rzSlECNKhxf9gpvF4jLw3Zsa4agTs" />
<!-- Removed duplicate header
<h1 class="post-title" itemprop="name headline">Helps</h1>
-->



<p class="header_box" id="about">About Ribocentre-aptamer database</p>
<p>Ribocentre-aptamer Database is designed to provide information on RNA aptamers. Each aptamer page includes a brief introduction and offers various search options, such as sequence, publications, structures, binding affinities, and applications. Users can submit new RNA aptamer cases or related comments through the submission portal to enhance our database. The Binding Sites page compiles information on binding sites verified by published studies and classifies the aptamers. The Applications page showcases examples of RNA aptamer applications in previous research, updated regularly. The Structures page offers detailed insights into different aspects of RNA aptamers, and the Publications page provides links to individual aptamer pages, structural details, and related publications.</p>
<br>




<p class="header_box" id="usage">How to use the database</p>
<p class="blowheader_box">Search channels</p>
<p>On the home page, we start with a brief introduction, hoping that you will understand some basic concepts of RNA aptamers. There are three available search channels on the home page: (1) You can use the navigation bar to switch to the Aptamers, Applications, or Fluorescence pages. (2) You can search by keyword in the search box in the header. (3) Above the table, you can search by keyword or switch to a specific page.</p>

<img src="/images/help/help1.png" alt="drawing" style="width:1000px;display:block;margin:5px;border-radius:8px;box-shadow: 2px 2px 10px #888;">
<br>


<img src="/images/help/help2.png" alt="drawing" style="width:1000px;display:block;margin:5px;border-radius:8px;box-shadow: 2px 2px 10px #888;" class="img-responsive">
<div style="display: flex; justify-content: center;"></div>
<br>

<p class="blowheader_box">Advanced search functionality</p>
<p>For a more precise search experience, you can visit the dedicated search page. On the search page, you can use multiple filtering criteria to narrow down your search scope, including but not limited to aptamer types, binding affinity ranges, publication years, and more. This advanced search functionality helps you quickly find RNA aptamer information that meets specific requirements, improving search efficiency and accuracy.</p>
<br>

<img src="/images/help/help8.png" alt="drawing" style="width:1000px;display:block;margin:5px;border-radius:8px;box-shadow: 2px 2px 10px #888;" class="img-responsive">
<div style="display: flex; justify-content: center;"></div>
<br>

<img src="/images/help/help9.png" alt="drawing" style="width:1000px;display:block;margin:5px;border-radius:8px;box-shadow: 2px 2px 10px #888;" class="img-responsive">
<div style="display: flex; justify-content: center;"></div>
<br>

<p class="blowheader_box">Download channels</p>
<p>In each page, we mainly display the information of different RNA aptamers in table form. You can click the download button to download the information in different formats. When you want to download the information of a specific aptamer, you can filter it by search first and then download it.</p>
<img src="/images/help/help3.png" alt="drawing" style="width:1000px;display:block;margin:5px;border-radius:8px;box-shadow: 2px 2px 10px #888;">
<br>

<img src="/images/help/help4.png" alt="drawing" style="width:1000px;display:block;margin:5px;border-radius:8px;box-shadow: 2px 2px 10px #888;" class="img-responsive">
<div style="display: flex; justify-content: center;"></div>
<br>

<p class="blowheader_box">Interactive visualization</p>
<p>Clink the aptamer name in aptamer page, and it would send you to a new page which shows the timeline, structure, binding pockets information and so on of the riboswitch you choosed. For 3d structures you can use the interactive window to colour the structure or click on the zoom button on the right to go to a new page with more detailed information. In addition, we provide information about similar ligands to help you transform aptamers. We hope you can find all the information available in this database.</p>
<img src="/images/help/help5.png" alt="drawing" style="width:1000px;display:block;margin:5px;border-radius:8px;box-shadow: 2px 2px 10px #888;" class="img-responsive">
<img src="/images/help/help6.png" alt="drawing" style="width:1000px;display:block;margin:5px;border-radius:8px;box-shadow: 2px 2px 10px #888;" class="img-responsive">
<div style="display: flex; justify-content: center;"></div>
<br>




<p class="blowheader_box">Feedback channel</p>
<p>To keep pace with the latest developments in RNA aptamers research, the database will undergo regular updates.  In home page, We provide a link to the feedback button. In addition, Click the top button to return to a series of database collections.</p>
<img src="/images/help/help7.png" alt="drawing" style="width:1000px;display:block;margin:5px;border-radius:8px;box-shadow: 2px 2px 10px #888;" class="img-responsive">
<div style="display: flex; justify-content: center;"></div>
<br>


<p class="header_box" id="api">API Access</p>
<p>The Ribocentre-Aptamer platform provides a robust API for programmatic access to our aptamer database. This API enables researchers to integrate our data into automated workflows, perform batch queries, and access comprehensive aptamer information in a structured format. Both web interface and programmatic access support URL-based search parameters for real-time data filtering.</p>

<p class="blowheader_box">API Endpoints</p>
<p>Our API offers multiple access points for retrieving aptamer data:</p>
<ul style="padding-left: 20px;">
  <li><strong>Sequences Page:</strong> <code style="background-color: #f4f4f4; padding: 2px 6px; border-radius: 3px;">https://aptamer.gznl.org/sequences/</code> - Interactive web interface with search support; returns filtered HTML by default, JSON with <code style="background-color: #f4f4f4; padding: 2px 6px; border-radius: 3px;">format=json</code> parameter</li>
  <li><strong>JSON API:</strong> <code style="background-color: #f4f4f4; padding: 2px 6px; border-radius: 3px;">https://aptamer.gznl.org/api/</code> - Dedicated API endpoint, always returns JSON format with enhanced debugging information</li>
</ul>

<p class="blowheader_box">Query Parameters</p>
<p>The API supports various query parameters for filtering and searching:</p>
<ul style="padding-left: 20px;">
  <li><strong>search:</strong> Search across all aptamer fields (sequence, ligand, name, etc.)</li>
  <li><strong>id:</strong> Filter results by specific aptamer ID</li>
  <li><strong>category:</strong> Filter by aptamer category</li>
  <li><strong>type:</strong> Filter by aptamer type (RNA, DNA)</li>
  <li><strong>format:</strong> Request data in JSON format (only for <code style="background-color: #f4f4f4; padding: 2px 6px; border-radius: 3px;">/sequences/</code> endpoint)</li>
  <li><strong>limit:</strong> Limit the number of results returned (only for <code style="background-color: #f4f4f4; padding: 2px 6px; border-radius: 3px;">/api/</code> endpoint)</li>
  <li><strong>offset:</strong> Specify pagination offset (only for <code style="background-color: #f4f4f4; padding: 2px 6px; border-radius: 3px;">/api/</code> endpoint)</li>
</ul>

<p class="blowheader_box">Usage Examples</p>
<p>Here are some common API usage patterns:</p>

<pre style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 5px; padding: 15px; overflow-x: auto; font-family: Monaco, 'Lucida Console', monospace;">
# Search for ATP-related aptamers (JSON API - always returns JSON)
curl "https://aptamer.gznl.org/api/?search=ATP"

# Get specific aptamer by ID (JSON API)
curl "https://aptamer.gznl.org/api/?id=ATP_Szostak_1"

# Get results with pagination (JSON API supports limit/offset)
curl "https://aptamer.gznl.org/api/?search=DNA&limit=10&offset=0"

# Search via sequences page with JSON format
curl "https://aptamer.gznl.org/sequences/?search=thrombin&format=json"

# Search via sequences page (returns filtered HTML results)
curl "https://aptamer.gznl.org/sequences/?search=thrombin"

# Visit sequences page with search results in browser
# https://aptamer.gznl.org/sequences/?search=thrombin
</pre>

<p class="blowheader_box">Response Format</p>
<p>API responses include comprehensive debugging information and statistics:</p>

<pre style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 5px; padding: 15px; overflow-x: auto; font-family: Monaco, 'Lucida Console', monospace;">
{
  "success": true,
  "message": "Found 5 result(s)",
  "query": {
    "search": "ATP",
    "timestamp": "2025-01-01T12:00:00.000Z"
  },
  "statistics": {
    "total_in_database": 250,
    "filtered_results": 5,
    "returned_results": 5
  },
  "data": [...]
}
</pre>

<p class="blowheader_box">Data Fields</p>
<p>Each aptamer entry contains comprehensive information including sequence, target ligand, binding affinity, structure details, and publication references. The API provides access to all fields available in the web interface, enabling complete data integration.</p>

<p class="blowheader_box">Best Practices</p>
<p>For optimal API usage, we recommend:</p>
<ul style="padding-left: 20px;">
  <li>Implement reasonable delays between requests to avoid overwhelming the server</li>
  <li>Cache frequently accessed data locally to reduce server load</li>
  <li>Include proper error handling for network issues</li>
  <li>Always cite our database when using data in publications</li>
</ul>

<p>For detailed API documentation and technical specifications, please visit our dedicated <a href="/api/" style="color:#520049"><strong>API Documentation page</strong></a>.</p>
<br>


<p class="header_box" id="contact">How to contact us</p>
<p>For any inquiries or concerns regarding the database, please reach out to <a style="color:#520049"><b><i>2112240208@gdpu.edu.cn</i></b></a>.</p>




<p class="header_box" id="group">Group Members</p>
<div class="row">
    <div class="col-sm-6 clearfix">
      <p><img src="/images/groupmember/Chichau_photo.jpg" class="img-responsive" width="23%" style="float: left;margin-right: 10px;box-shadow: 2px 2px 5px #888;" /></p>
      <h4 ><a href="mailto:miao_zhichao@gzlab.ac.cn">Zhichao (Chichau) Miao</a></h4>
      <p><i>Principal Investigator of Guangzhou Lab</i></p>
      <ul style="overflow: hidden; margin-top: 10px;padding-left: 20px;">
        <temli>PhD <a href="http://ibp.cas.cn/">Institute of Biophysics, CAS</a></temli><br>
        <temli>Chercheur at <a href="https://ibmc.cnrs.fr/en/">IBMC, CNRS</a></temli><br>
        <temli>PostDoc at <a href="https://www.ebi.ac.uk/">EMBL-EBI</a></temli><br>
        <temli>Visiting Scientist at <a href="https://www.sanger.ac.uk/">Wellcome Sanger Institute</a></temli><br>
        <temli>Senior Bioinformatician at <a href="https://www.ebi.ac.uk/">EMBL-EBI</a></temli>
      </ul>
    </div>
    <div class="col-sm-6 clearfix">
      <p><img src="/images/groupmember/Lin_Huang.jpg" class="img-responsive" width="25%" style="float: left;margin-right:10px;box-shadow: 2px 2px 5px #888;"></p>
      <h4><a href="mailto:huanglin36@mail.sysu.edu.cn">Lin Huang</a></h4>
      <p><i>Principal Investigator of Sun Yat-sen University</i></p>
      <ul style="overflow: hidden; margin-top: 10px;padding-left: 20px;">
        <temli>PhD <a href="https://en.whu.edu.cn/">Wuhan University</a></temli><br>
        <temli>Postdoctoral research assistant at <a href="https://www.dundee.ac.uk/">University of Dundee, UK</a></temli><br>
        <temli>Senior research associate at <a href="https://www.dundee.ac.uk/">University of Dundee, UK</a></temli><br>
      </ul>
    </div>           
    <div class="col-sm-6 clearfix">
      <p><img src="/images/groupmember/Shuang_Zhu.png" class="img-responsive" width="25%" style="float: left;margin-right:10px;box-shadow: 2px 2px 5px #888;"></p>
      <h4><a href="mailto:15683727@qq.com">Shuang Zhu</a></h4>
      <p><i>Director of the Department of Biotechnology, Guangdong Pharmaceutical University</i></p>
      <ul style="overflow: hidden; margin-top: 10px;padding-left: 20px;">
        <temli>PhD <a href="https://www.sysu.edu.cn/">Sun Yet-sen University, China</a></temli><br>
        <temli>MS <a href="https://www.sysu.edu.cn/">Sun Yet-sen University, China</a></temli><br>
        <temli>BS <a href="https://www.sysu.edu.cn/">Sun Yet-sen University, China</a></temli><br>
      </ul>
    </div>    
<br>
