### test wih js disabled in browser

### Benchmark

- load testing
- memory leak testing

### Remove the style injected by angular in the head on page load, so they are not defined two times

It will help remove the tidy library used to display only the body in the tests

```
<style type="text/css">@charset "UTF-8";[ng\:cloak],[ng-cloak],[data-ng-cloak],[x-ng-cloak],.ng-cloak,.x-ng-clo
```
        
### Pending

1. More testing
2. Write unit tests
3. Package it into a .deb
4. Benchmarks
5. Memory testing
 
###PHP integration
```php
 <?php
 ob_start();
 
 .... rendering

 $html = ob_get_content();

```

 Connect with http://elephant.io/ to the renderer server, and then send the url/html to get the rendered result.
 
 
### Steps for log visualization


<!--

1 - install GrayLog

apt-get install apt-transport-https openjdk-8-jre-headless uuid-runtime pwgen
apt-get install mongodb-server
wget -qO - https://packages.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
echo "deb https://packages.elastic.co/elasticsearch/2.x/debian stable main" | sudo tee -a /etc/apt/sources.list.d/elasticsearch-2.x.list
sudo apt-get update && sudo apt-get install elasticsearch


    Make sure to modify the Elasticsearch configuration file (/etc/elasticsearch/elasticsearch.yml) and set the cluster name to graylog:

    cluster.name: graylog


$ sudo /bin/systemctl daemon-reload
$ sudo /bin/systemctl enable elasticsearch.service
$ sudo /bin/systemctl restart elasticsearch.service


Graylog
Now install the Graylog repository configuration and Graylog itself with the following commands:
````
wget https://packages.graylog2.org/repo/packages/graylog-2.1-repository_latest.deb
sudo dpkg -i graylog-2.1-repository_latest.deb
sudo apt-get update && sudo apt-get install graylog-server
```
http://docs.graylog.org/en/2.1/pages/installation/os/ubuntu.html


https://download.elastic.co/elasticsearch/release/org/elasticsearch/distribution/deb/elasticsearch/2.4.1/elasticsearch-2.4.1.deb
https://download.elastic.co/logstash/logstash/packages/debian/logstash-2.4.0_all.deb
https://download.elastic.co/kibana/kibana/kibana-4.6.1-amd64.deb

-->